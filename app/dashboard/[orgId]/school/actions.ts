'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const CLASS_OPTIONS = [
  'Preschool', 'Day Care', 'Pre Nursery', 'Nursery', 'LKG', 'UKG',
  ...Array.from({ length: 12 }, (_, index) => `Class ${index + 1}`),
]

async function getSchoolAccess(orgId: string, permission: 'manage_school' | 'students' | 'staff') {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (member?.role === 'FRANCHISE_ADMIN' || (
    Array.isArray(member.permissions) &&
    (member.permissions.includes(permission) || ((permission === 'students' || permission === 'staff') && member.permissions.includes('manage_school')))
  )))
  if (!allowed) throw new Error('You do not have permission to manage this school.')
  return supabase
}

export async function getSchoolData(orgId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const [
    { data: classes, error: classError }, 
    { data: sections, error: sectionError }, 
    { data: subjects, error: subjectError }, 
    { data: sectionTeachers, error: sectionTeacherError }, 
    { data: subjectTeachers, error: subjectTeacherError },
    { data: houses, error: houseError },
    { data: students, error: studentError }
  ] = await Promise.all([
    supabase.from('school_classes').select('id, name, sort_order').eq('org_id', orgId).order('sort_order').order('name'),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
    supabase.from('school_subjects').select('id, class_id, section_id, name, knowledge_type, is_compulsory').eq('org_id', orgId).order('name'),
    supabase.from('school_section_teachers').select('section_id, teacher_id').eq('org_id', orgId),
    supabase.from('school_subject_teachers').select('subject_id, teacher_id').eq('org_id', orgId),
    supabase.from('school_houses').select('id, name, color').eq('org_id', orgId).order('name'),
    supabase.from('students').select('id, student_name, section_id, admission_number, gender, date_of_birth, guardian_name, phone, status, student_details(profile_picture_path)').eq('org_id', orgId).order('student_name'),
  ])
  if (classError || sectionError || subjectError || sectionTeacherError || subjectTeacherError || studentError) throw new Error(classError?.message ?? sectionError?.message ?? subjectError?.message ?? sectionTeacherError?.message ?? subjectTeacherError?.message ?? studentError?.message)
  const { data: teachers, error: teacherError } = await createAdminClient().from('school_teachers').select('id, name, email, phone, status').eq('org_id', orgId).order('name')
  if (teacherError) throw new Error(teacherError.message)
  
  let studentsWithUrls = students ?? []
  if (studentsWithUrls.length > 0) {
    const admin = createAdminClient()
    const paths = studentsWithUrls.map(s => {
      const details = Array.isArray(s.student_details) ? s.student_details[0] : s.student_details
      return details?.profile_picture_path
    }).filter(Boolean) as string[]
    
    if (paths.length > 0) {
      const { data: signedUrls } = await admin.storage.from('student-profile-images').createSignedUrls(paths, 3600)
      const urlMap = new Map(signedUrls?.map(u => [u.path, u.signedUrl]))
      
      studentsWithUrls = studentsWithUrls.map(s => {
        const details = Array.isArray(s.student_details) ? s.student_details[0] : s.student_details
        const path = details?.profile_picture_path
        return {
          ...s,
          avatar_url: path ? urlMap.get(path) || null : null
        }
      })
    }
  }

  return { 
    classes: classes ?? [], 
    sections: sections ?? [], 
    subjects: subjects ?? [], 
    teachers: teachers ?? [], 
    sectionTeachers: sectionTeachers ?? [], 
    subjectTeachers: subjectTeachers ?? [],
    houses: houses ?? [],
    students: studentsWithUrls
  }
}

async function requireSchoolManager(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, status, permissions').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (member.role === 'FRANCHISE_ADMIN' || (Array.isArray(member.permissions) && member.permissions.includes('manage_school'))))
  if (!allowed) throw new Error('You do not have permission to manage school teachers.')
  const invitedByRole = org?.owner_id === user.id ? 'ADMIN' : member?.role === 'FRANCHISE_ADMIN' ? 'FRANCHISE_ADMIN' : 'SCHOOL_MANAGER'
  return { supabase, admin: createAdminClient(), invitedByRole }
}

export async function createSchoolTeacher(orgId: string, formData: FormData) {
  const { supabase, admin, invitedByRole } = await requireSchoolManager(orgId)
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phone = String(formData.get('phone') ?? '').trim()
  if (!name || name.length > 120) throw new Error('Enter the teacher’s full name.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
  const { data: existingTeacher } = await admin.from('school_teachers').select('id').eq('org_id', orgId).ilike('email', email).maybeSingle()
  if (existingTeacher) throw new Error('A teacher with this email is already listed for this franchise.')
  const teacherId = crypto.randomUUID()
  const { error: insertError } = await admin.from('school_teachers').insert({ id: teacherId, org_id: orgId, name, email, phone: phone || null, role: 'TEACHER', invited_by_role: invitedByRole, status: 'PENDING' })
  if (insertError) throw new Error(insertError.message)

  const teacherNext = encodeURIComponent(`/teacher/${orgId}`)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000'
  const redirectTo = `${siteUrl}/set-password?next=${teacherNext}`
  const { data: invite, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: name, role: 'TEACHER', org_id: orgId, teacher_id: teacherId, invited_by_role: invitedByRole },
    redirectTo,
  })
  
  let finalUserId: string | null = null;
  if (!inviteError && invite.user) {
    await admin.from('school_teachers').update({ user_id: invite.user.id }).eq('org_id', orgId).eq('id', teacherId)
    finalUserId = invite.user.id
  } else if (inviteError && /already\s+(been\s+)?registered/i.test(inviteError.message)) {
    const { data: authUsers, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listError) {
      await admin.from('school_teachers').delete().eq('org_id', orgId).eq('id', teacherId)
      throw new Error(listError.message)
    }
    const matched = authUsers.users.find((authUser) => authUser.email?.toLowerCase() === email)
    if (!matched) {
      await admin.from('school_teachers').delete().eq('org_id', orgId).eq('id', teacherId)
      throw new Error(inviteError.message)
    }
    if (!matched.email_confirmed_at) {
      const { error: passwordLinkError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (passwordLinkError) throw new Error(passwordLinkError.message)
    }
    const { error: attachError } = await admin.from('school_teachers').update({ user_id: matched.id, status: matched.email_confirmed_at ? 'ACTIVE' : 'PENDING' }).eq('org_id', orgId).eq('id', teacherId)
    if (attachError) throw new Error(attachError.message)
    finalUserId = matched.id
  } else {
    await admin.from('school_teachers').delete().eq('org_id', orgId).eq('id', teacherId)
    throw new Error(inviteError?.message ?? 'Could not send the teacher invitation.')
  }

  const avatar = formData.get('avatar')
  if (avatar instanceof File && avatar.size && finalUserId) {
    const suffix = avatar.type === 'image/png' ? 'png' : avatar.type === 'image/webp' ? 'webp' : 'jpg'
    const filePath = `${orgId}/${teacherId}/${crypto.randomUUID()}.${suffix}`
    
    // First ensure the bucket exists
    await admin.storage.createBucket('teacher_avatars', { public: true }).catch(() => {})
    
    const { error: uploadError } = await admin.storage.from('teacher_avatars').upload(filePath, avatar, { contentType: avatar.type })
    if (!uploadError) {
      const { data } = admin.storage.from('teacher_avatars').getPublicUrl(filePath)
      if (data?.publicUrl) {
        // Attempt to update the teacher record with the new URL. 
        // Note: The public.school_teachers table needs an avatar_url column for this to succeed!
        const { error: avatarUpdateError } = await admin.from('school_teachers').update({ avatar_url: data.publicUrl }).eq('id', teacherId)
        if (avatarUpdateError) console.error(avatarUpdateError)
      }
    }
  }

  revalidatePath(`/dashboard/${orgId}/school`)
  revalidatePath(`/dashboard/${orgId}/staff`)
}

export async function addSchoolClass(orgId: string, name: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const selected = CLASS_OPTIONS.find((item) => item.toLowerCase() === name.trim().toLowerCase())
  if (!selected) throw new Error('Choose a class from the list.')
  const { data: current, error: listError } = await supabase.from('school_classes').select('id').eq('org_id', orgId)
  if (listError) throw new Error(listError.message)
  const { error } = await supabase.from('school_classes').insert({ org_id: orgId, name: selected, sort_order: CLASS_OPTIONS.indexOf(selected) })
  if (error) throw new Error(error.code === '23505' ? 'This class already exists.' : error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
  return { count: (current?.length ?? 0) + 1 }
}

export async function addSchoolSection(orgId: string, classId: string, name: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const normalized = name.trim().toUpperCase()
  if (!/^[A-Z]$/.test(normalized)) throw new Error('Sections are created in alphabetical order from A to Z.')
  const { data: existing, error: listError } = await supabase.from('school_sections').select('name').eq('org_id', orgId).eq('class_id', classId)
  if (listError) throw new Error(listError.message)
  const expected = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find((letter) => !(existing ?? []).some((section) => section.name.trim().toUpperCase() === letter))
  if (!expected) throw new Error('All sections A to Z have already been created for this class.')
  if (normalized !== expected) throw new Error(`The next section for this class is ${expected}.`)
  const { error } = await supabase.from('school_sections').insert({ org_id: orgId, class_id: classId, name: normalized })
  if (error) throw new Error(error.code === '23505' ? 'This section already exists for the class.' : error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
}

export async function addSchoolSubject(orgId: string, classId: string, sectionId: string, name: string, knowledgeType: string, isCompulsory: boolean) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const normalized = name.trim()
  if (!normalized || normalized.length > 60) throw new Error('Enter a subject name up to 60 characters.')
  const { error } = await supabase.from('school_subjects').insert({ org_id: orgId, class_id: classId, section_id: sectionId, name: normalized, knowledge_type: knowledgeType, is_compulsory: isCompulsory })
  if (error) throw new Error(error.code === '23505' ? 'This subject is already listed for the section.' : error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
}

async function requireSchoolTeacher(orgId: string, teacherId: string) {
  const { data: teacher, error } = await createAdminClient().from('school_teachers').select('id, status').eq('org_id', orgId).eq('id', teacherId).maybeSingle()
  if (error || !teacher) {
    throw new Error(error?.message ?? 'Choose a teacher from this franchise.')
  }
}

export async function assignTeacherToSection(orgId: string, sectionId: string, teacherId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  await requireSchoolTeacher(orgId, teacherId)
  const { error } = await supabase.from('school_section_teachers').insert({ org_id: orgId, section_id: sectionId, teacher_id: teacherId })
  if (error) throw new Error(error.code === '23505' ? 'This teacher is already assigned to the section.' : error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
  revalidatePath(`/dashboard/${orgId}/staff`)
}

export async function assignTeacherToSubject(orgId: string, subjectId: string, teacherId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  await requireSchoolTeacher(orgId, teacherId)
  const { error } = await supabase.from('school_subject_teachers').insert({ org_id: orgId, subject_id: subjectId, teacher_id: teacherId })
  if (error) throw new Error(error.code === '23505' ? 'This teacher is already assigned to the subject.' : error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
  revalidatePath(`/dashboard/${orgId}/staff`)
}

export async function getTeacherAssignments(orgId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const [{ data: classes, error: classError }, { data: sections, error: sectionError }, { data: subjects, error: subjectError }, { data: sectionTeachers, error: sectionTeacherError }, { data: subjectTeachers, error: subjectTeacherError }] = await Promise.all([
    supabase.from('school_classes').select('id, name').eq('org_id', orgId).order('sort_order').order('name'),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId),
    supabase.from('school_subjects').select('id, class_id, section_id, name').eq('org_id', orgId).order('name'),
    supabase.from('school_section_teachers').select('section_id, teacher_id').eq('org_id', orgId),
    supabase.from('school_subject_teachers').select('subject_id, teacher_id').eq('org_id', orgId),
  ])
  if (classError || sectionError || subjectError || sectionTeacherError || subjectTeacherError) throw new Error(classError?.message ?? sectionError?.message ?? subjectError?.message ?? sectionTeacherError?.message ?? subjectTeacherError?.message)
  const { data: teachers, error: teacherError } = await createAdminClient().from('school_teachers').select('id, name, email, phone, status').eq('org_id', orgId).order('name')
  if (teacherError) throw new Error(teacherError.message)
  return { classes: classes ?? [], sections: sections ?? [], subjects: subjects ?? [], sectionTeachers: sectionTeachers ?? [], subjectTeachers: subjectTeachers ?? [], teachers: teachers ?? [] }
}

export async function addSchoolHouse(orgId: string, formData: FormData) {
  const { admin } = await requireSchoolManager(orgId)
  const name = String(formData.get('name') ?? '').trim()
  const color = String(formData.get('color') ?? '').trim()
  if (!name || !color) throw new Error('House name and color are required.')
  
  const { error } = await admin.from('school_houses').insert({
    org_id: orgId,
    name,
    color,
  })
  
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
}

export async function deleteSchoolClass(orgId: string, classId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const { error } = await supabase.from('school_classes').delete().eq('org_id', orgId).eq('id', classId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
}

export async function deleteSchoolSection(orgId: string, sectionId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const { error } = await supabase.from('school_sections').delete().eq('org_id', orgId).eq('id', sectionId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
}

export async function deleteSchoolSubject(orgId: string, subjectId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const { error } = await supabase.from('school_subjects').delete().eq('org_id', orgId).eq('id', subjectId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
}
