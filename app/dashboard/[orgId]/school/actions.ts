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
  const [{ data: classes, error: classError }, { data: sections, error: sectionError }, { data: subjects, error: subjectError }, { data: classTeachers, error: classTeacherError }, { data: subjectTeachers, error: subjectTeacherError }] = await Promise.all([
    supabase.from('school_classes').select('id, name, sort_order').eq('org_id', orgId).order('sort_order').order('name'),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
    supabase.from('school_subjects').select('id, class_id, section_id, name').eq('org_id', orgId).order('name'),
    supabase.from('school_class_teachers').select('class_id, teacher_id').eq('org_id', orgId),
    supabase.from('school_subject_teachers').select('subject_id, teacher_id').eq('org_id', orgId),
  ])
  if (classError || sectionError || subjectError || classTeacherError || subjectTeacherError) throw new Error(classError?.message ?? sectionError?.message ?? subjectError?.message ?? classTeacherError?.message ?? subjectTeacherError?.message)
  const { data: teachers, error: teacherError } = await createAdminClient().from('school_teachers').select('id, name, email, phone, status').eq('org_id', orgId).order('name')
  if (teacherError) throw new Error(teacherError.message)
  return { classes: classes ?? [], sections: sections ?? [], subjects: subjects ?? [], teachers: teachers ?? [], classTeachers: classTeachers ?? [], subjectTeachers: subjectTeachers ?? [] }
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
  if (!inviteError && invite.user) {
    await admin.from('school_teachers').update({ user_id: invite.user.id }).eq('org_id', orgId).eq('id', teacherId)
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
    // Existing accounts keep their sign-in method; the franchise admin can send a password setup link if needed.
  } else {
    await admin.from('school_teachers').delete().eq('org_id', orgId).eq('id', teacherId)
    throw new Error(inviteError?.message ?? 'Could not send the teacher invitation.')
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

export async function addSchoolSubject(orgId: string, classId: string, sectionId: string, name: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  const normalized = name.trim()
  if (!normalized || normalized.length > 60) throw new Error('Enter a subject name up to 60 characters.')
  const { error } = await supabase.from('school_subjects').insert({ org_id: orgId, class_id: classId, section_id: sectionId, name: normalized })
  if (error) throw new Error(error.code === '23505' ? 'This subject is already listed for the section.' : error.message)
  revalidatePath(`/dashboard/${orgId}/school`)
}

async function requireSchoolTeacher(orgId: string, teacherId: string) {
  const { data: teacher, error } = await createAdminClient().from('school_teachers').select('id, status').eq('org_id', orgId).eq('id', teacherId).maybeSingle()
  if (error || !teacher) {
    throw new Error(error?.message ?? 'Choose a teacher from this franchise.')
  }
}

export async function assignTeacherToClass(orgId: string, classId: string, teacherId: string) {
  const supabase = await getSchoolAccess(orgId, 'manage_school')
  await requireSchoolTeacher(orgId, teacherId)
  const { error } = await supabase.from('school_class_teachers').insert({ org_id: orgId, class_id: classId, teacher_id: teacherId })
  if (error) throw new Error(error.code === '23505' ? 'This teacher is already assigned to the class.' : error.message)
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
  const [{ data: classes, error: classError }, { data: sections, error: sectionError }, { data: subjects, error: subjectError }, { data: classTeachers, error: classTeacherError }, { data: subjectTeachers, error: subjectTeacherError }] = await Promise.all([
    supabase.from('school_classes').select('id, name').eq('org_id', orgId).order('sort_order').order('name'),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId),
    supabase.from('school_subjects').select('id, class_id, section_id, name').eq('org_id', orgId).order('name'),
    supabase.from('school_class_teachers').select('class_id, teacher_id').eq('org_id', orgId),
    supabase.from('school_subject_teachers').select('subject_id, teacher_id').eq('org_id', orgId),
  ])
  if (classError || sectionError || subjectError || classTeacherError || subjectTeacherError) throw new Error(classError?.message ?? sectionError?.message ?? subjectError?.message ?? classTeacherError?.message ?? subjectTeacherError?.message)
  const { data: teachers, error: teacherError } = await createAdminClient().from('school_teachers').select('id, name, email, phone, status').eq('org_id', orgId).order('name')
  if (teacherError) throw new Error(teacherError.message)
  return { classes: classes ?? [], sections: sections ?? [], subjects: subjects ?? [], classTeachers: classTeachers ?? [], subjectTeachers: subjectTeachers ?? [], teachers: teachers ?? [] }
}
