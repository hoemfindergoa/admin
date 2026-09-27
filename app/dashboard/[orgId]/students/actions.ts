'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getStudentAccess(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (
    member?.role === 'FRANCHISE_ADMIN' || (Array.isArray(member.permissions) &&
      (member.permissions.includes('students') || member.permissions.includes('manage_school')))
  ))
  if (!allowed) throw new Error('You do not have permission to manage students.')
  return supabase
}

export async function getStudentWorkspace(orgId: string) {
  const supabase = await getStudentAccess(orgId)
  const [{ data: students, error: studentError }, { data: classes, error: classError }, { data: sections, error: sectionError }, { data: details, error: detailsError }, { data: houses, error: housesError }, { data: subjects, error: subjectsError }] = await Promise.all([
    supabase.from('students').select('id, student_name, admission_number, date_of_birth, gender, guardian_name, guardian_phone, guardian_email, class_id, section_id, status, roll_number, registration_number, student_type, transport_type, category, email, phone, updated_at, updated_by_email').eq('org_id', orgId).order('student_name'),
    supabase.from('school_classes').select('id, name').eq('org_id', orgId).order('sort_order').order('name'),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
    supabase.from('student_details').select('student_id, house_id, active_fee, optional_subjects, details, siblings, concessions, profile_picture_path, updated_at, updated_by_email').eq('org_id', orgId),
    supabase.from('school_houses').select('id, name').eq('org_id', orgId).order('name'),
    supabase.from('school_subjects').select('id, class_id, section_id, name').eq('org_id', orgId).order('name'),
  ])
  if (studentError || classError || sectionError || detailsError || housesError || subjectsError) throw new Error(studentError?.message ?? classError?.message ?? sectionError?.message ?? detailsError?.message ?? housesError?.message ?? subjectsError?.message)
  const admin = createAdminClient()
  const detailed = await Promise.all((details ?? []).map(async (item) => {
    if (!item.profile_picture_path) return item
    const { data } = await admin.storage.from('student-profile-images').createSignedUrl(item.profile_picture_path, 3600)
    return { ...item, profile_picture_url: data?.signedUrl ?? null }
  }))
  return { students: students ?? [], classes: classes ?? [], sections: sections ?? [], details: detailed, houses: houses ?? [], subjects: subjects ?? [] }
}

const studentDetailKeys = [
  'caste', 'nationality', 'place_of_birth', 'identity_mark', 'pen_no', 'apaar_id', 'student_code', 'religion',
  'birth_certificate', 'aadhaar', 'pan', 'blood_group', 'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
  'father_name', 'father_phone', 'father_qualification', 'father_occupation', 'father_annual_income', 'father_office_phone', 'father_aadhaar',
  'mother_name', 'mother_phone', 'mother_qualification', 'mother_occupation', 'mother_annual_income', 'mother_office_phone', 'mother_aadhaar',
  'guardian_relation', 'guardian_address', 'emergency_contact', 'admission_date', 'previous_organization', 'previous_institute', 'tc_number',
  'previous_class', 'previous_percentage', 'special_needs',
] as const

function readJsonField<T>(formData: FormData, key: string, fallback: T): T {
  const value = formData.get(key)
  if (typeof value !== 'string' || !value) return fallback
  try { return JSON.parse(value) as T } catch { throw new Error(`Invalid ${key} data.`) }
}

export async function saveStudent(orgId: string, formData: FormData) {
  const supabase = await getStudentAccess(orgId)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const studentId = String(formData.get('student_id') ?? '').trim()
  const classId = String(formData.get('class_id') ?? '')
  const sectionId = String(formData.get('section_id') ?? '')
  const studentName = String(formData.get('student_name') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const studentType = String(formData.get('student_type') ?? '').trim()
  if (!classId || !sectionId || !studentName || !phone || !category || !studentType) throw new Error('Fill in class, section, name, phone, student type, and category.')
  const { data: section, error: sectionError } = await supabase.from('school_sections').select('id').eq('org_id', orgId).eq('class_id', classId).eq('id', sectionId).maybeSingle()
  if (sectionError || !section) throw new Error(sectionError?.message ?? 'Choose a section within the selected class.')

  const detail: Record<string, string | null> = {}
  for (const key of studentDetailKeys) detail[key] = String(formData.get(key) ?? '').trim() || null
  const siblings = readJsonField<Array<{ name: string; class: string }>>(formData, 'siblings', [])
  const concessions = readJsonField<Array<{ name: string; amount: string; note: string }>>(formData, 'concessions', [])
  const optionalSubjects = readJsonField<string[]>(formData, 'optional_subjects', [])
  const activeFeeText = String(formData.get('active_fee') ?? '').trim()
  const activeFee = activeFeeText ? Number(activeFeeText) : null
  if (activeFeeText && (!Number.isFinite(activeFee) || activeFee! < 0)) throw new Error('Active fee must be a valid non-negative amount.')
  const photo = formData.get('profile_picture')
  if (photo instanceof File && photo.size && (photo.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(photo.type))) throw new Error('Profile picture must be JPG, PNG, or WebP and under 5 MB.')
  if (optionalSubjects.length) {
    const { data: validSubjects, error } = await supabase.from('school_subjects').select('id').eq('org_id', orgId).eq('class_id', classId).eq('section_id', sectionId).in('id', optionalSubjects)
    if (error || (validSubjects?.length ?? 0) !== optionalSubjects.length) throw new Error(error?.message ?? 'Choose subjects from the selected class and section.')
  }
  let houseId = String(formData.get('house_id') ?? '').trim() || null
  const newHouse = String(formData.get('new_house_name') ?? '').trim()
  if (newHouse) {
    const { data: matchingHouse, error: lookupError } = await supabase.from('school_houses').select('id').eq('org_id', orgId).ilike('name', newHouse).maybeSingle()
    if (lookupError) throw new Error(lookupError.message)
    if (matchingHouse) houseId = matchingHouse.id
    else {
      const { data: house, error } = await supabase.from('school_houses').insert({ org_id: orgId, name: newHouse }).select('id').single()
      if (error || !house) throw new Error(error?.message ?? 'Could not create house.')
      houseId = house.id
    }
  }
  const dateOfBirth = String(formData.get('date_of_birth') ?? '').trim() || null
  const admissionNumber = String(formData.get('admission_number') ?? '').trim() || null
  const createdBy = { created_by: user.id, created_by_email: user.email ?? null }
  const payload = {
    org_id: orgId, class_id: classId, section_id: sectionId, student_name: studentName, phone,
    admission_number: admissionNumber, roll_number: String(formData.get('roll_number') ?? '').trim() || null,
    registration_number: String(formData.get('registration_number') ?? '').trim() || null,
    student_type: studentType, transport_type: String(formData.get('transport_type') ?? '').trim() || null,
    category, email: String(formData.get('email') ?? '').trim() || null, date_of_birth: dateOfBirth,
    gender: String(formData.get('gender') ?? '').trim() || null,
    guardian_name: String(formData.get('guardian_name') ?? '').trim() || detail.father_name || detail.mother_name || 'Guardian',
    guardian_phone: String(formData.get('guardian_phone') ?? '').trim() || detail.father_phone || detail.mother_phone || 'NA',
    guardian_email: String(formData.get('guardian_email') ?? '').trim().toLowerCase() || null,
    updated_by: user.id, updated_by_email: user.email ?? null,
  }
  let savedId = studentId
  if (studentId) {
    const { error } = await supabase.from('students').update(payload).eq('org_id', orgId).eq('id', studentId)
    if (error) throw new Error(error.message)
  } else {
    const { data, error } = await supabase.from('students').insert({ ...payload, ...createdBy }).select('id').single()
    if (error || !data) throw new Error(error?.message ?? 'Could not create student.')
    savedId = data.id
  }
  const admin = createAdminClient()
  let profilePath: string | null = String(formData.get('existing_profile_picture_path') ?? '').trim() || null
  if (profilePath && !profilePath.startsWith(`${orgId}/${savedId}/`)) throw new Error('That profile picture does not belong to this student.')
  const warnings: string[] = []
  if (photo instanceof File && photo.size) {
    const suffix = photo.type === 'image/png' ? 'png' : photo.type === 'image/webp' ? 'webp' : 'jpg'
    const nextPath = `${orgId}/${savedId}/${crypto.randomUUID()}.${suffix}`
    const { error } = await admin.storage.from('student-profile-images').upload(nextPath, photo, { contentType: photo.type, upsert: false })
    if (error) warnings.push(`Profile picture was not saved: ${error.message}`)
    else profilePath = nextPath
  }
  const { error: detailError } = await admin.from('student_details').upsert({
    org_id: orgId, student_id: savedId, house_id: houseId, active_fee: activeFee,
    optional_subjects: optionalSubjects, details: detail, siblings, concessions,
    profile_picture_path: profilePath, updated_by: user.id, updated_by_email: user.email ?? null,
  }, { onConflict: 'org_id,student_id' })
  if (detailError) warnings.push(`Student details were saved incompletely: ${detailError.message}`)

  const guardianEmail = payload.guardian_email
  if (guardianEmail) {
    try { await linkOrInviteParent(admin, orgId, savedId, guardianEmail, payload.guardian_name || guardianEmail, payload.guardian_phone) }
    catch (cause) { warnings.push(`Parent account could not be linked or invited: ${cause instanceof Error ? cause.message : 'Unknown error'}`) }
  }
  revalidatePath(`/dashboard/${orgId}/students`)
  return { id: savedId, updatedAt: new Date().toISOString(), updatedBy: user.email ?? 'School staff', warning: warnings.length ? `Student saved. ${warnings.join(' ')}` : null }
}

async function linkOrInviteParent(admin: ReturnType<typeof createAdminClient>, orgId: string, studentId: string, email: string, name: string, phone: string | null) {
  const normalizedEmail = email.toLowerCase()
  let { data: parent, error } = await admin.from('school_parents').select('id, name, user_id').eq('org_id', orgId).ilike('email', normalizedEmail).maybeSingle()
  if (error) throw new Error(`Could not find parent account: ${error.message}`)
  if (!parent) {
    const result = await admin.from('school_parents').insert({ org_id: orgId, name, email: normalizedEmail, phone, status: 'PENDING' }).select('id, name, user_id').single()
    if (result.error || !result.data) throw new Error(result.error?.message ?? 'Could not create parent account.')
    parent = result.data
  }
  let parentStatus = 'PENDING'
  if (!parent.user_id) {
    const parentNext = encodeURIComponent(process.env.NEXT_PUBLIC_PARENT_APP_URL ?? '/')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000'
    const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(normalizedEmail, {
      data: { full_name: name, role: 'PARENT', org_id: orgId, parent_id: parent.id }, redirectTo: `${siteUrl}/set-password?next=${parentNext}`,
    })
    let authUserId = invitation?.user?.id ?? null
    if (inviteError && /already\s+(been\s+)?registered/i.test(inviteError.message)) {
      const { data: users, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
      if (listError) throw new Error(`Could not find existing login: ${listError.message}`)
      const existing = users.users.find((item) => item.email?.toLowerCase() === normalizedEmail)
      authUserId = existing?.id ?? null
      if (authUserId && !existing?.email_confirmed_at) {
        const { error: passwordError } = await admin.auth.resetPasswordForEmail(normalizedEmail, { redirectTo: `${siteUrl}/set-password?next=${parentNext}` })
        if (passwordError) throw new Error(`Could not send password setup link: ${passwordError.message}`)
      }
      if (existing?.email_confirmed_at) parentStatus = 'ACTIVE'
    } else if (inviteError) throw new Error(`Could not send password setup invite: ${inviteError.message}`)
    if (!authUserId) throw new Error('Parent invite was not sent. Check the email configuration and try again.')
    const { error: updateError } = await admin.from('school_parents').update({ user_id: authUserId, status: parentStatus }).eq('org_id', orgId).eq('id', parent.id)
    if (updateError) throw new Error(`Parent was invited but account linking failed: ${updateError.message}`)
  }
  const { error: linkError } = await admin.from('school_parent_students').upsert({ org_id: orgId, parent_id: parent.id, student_id: studentId }, { onConflict: 'org_id,parent_id,student_id', ignoreDuplicates: true })
  if (linkError) throw new Error(`Could not link parent to student: ${linkError.message}`)
}

type StudentImportRow = { [key: string]: string | undefined; student_name?: string; admission_number?: string; date_of_birth?: string; gender?: string; phone?: string; student_type?: string; category?: string; guardian_name?: string; guardian_phone?: string; guardian_email?: string; class?: string; section?: string }

export async function importStudents(orgId: string, rows: StudentImportRow[]) {
  const supabase = await getStudentAccess(orgId)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  if (!rows.length || rows.length > 500) throw new Error('Import between 1 and 500 students at a time.')
  const [{ data: classes, error: classError }, { data: sections, error: sectionError }, { data: allSubjects, error: subjectError }] = await Promise.all([
    supabase.from('school_classes').select('id, name').eq('org_id', orgId),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId),
    supabase.from('school_subjects').select('id, class_id, section_id, name').eq('org_id', orgId),
  ])
  if (classError || sectionError || subjectError) throw new Error(classError?.message ?? sectionError?.message ?? subjectError?.message)
  const classByName = new Map((classes ?? []).map((item) => [item.name.trim().toLowerCase(), item]))
  const errors: string[] = []
  const seenAdmissions = new Set<string>()
  const prepared = rows.map((row, index) => {
    const line = index + 2
    const studentName = String(row.student_name ?? '').trim()
    const studentPhone = String(row.phone ?? '').trim()
    const studentType = String(row.student_type ?? '').trim()
    const category = String(row.category ?? '').trim()
    const classItem = classByName.get(String(row.class ?? '').trim().toLowerCase())
    const sectionItem = (sections ?? []).find((item) => item.class_id === classItem?.id && item.name.trim().toLowerCase() === String(row.section ?? '').trim().toLowerCase())
    const admission = String(row.admission_number ?? '').trim()
    if (!studentName) errors.push(`Row ${line}: student_name is required.`)
    if (!studentPhone) errors.push(`Row ${line}: phone is required.`)
    if (!studentType) errors.push(`Row ${line}: student_type is required.`)
    if (!category) errors.push(`Row ${line}: category is required.`)
    if (!classItem) errors.push(`Row ${line}: class does not match a class in this school.`)
    if (!sectionItem) errors.push(`Row ${line}: section does not match a section in the selected class.`)
    const date = String(row.date_of_birth ?? '').trim()
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push(`Row ${line}: date_of_birth must use YYYY-MM-DD.`)
    if (admission) {
      const normalized = admission.toLowerCase()
      if (seenAdmissions.has(normalized)) errors.push(`Row ${line}: admission_number is duplicated in this file.`)
      seenAdmissions.add(normalized)
    }
    return {
      org_id: orgId, student_name: studentName, admission_number: admission || null,
      created_by: user.id, created_by_email: user.email ?? null, updated_by: user.id, updated_by_email: user.email ?? null,
      date_of_birth: date || null, gender: String(row.gender ?? '').trim() || null,
      phone: studentPhone, student_type: studentType, category,
      roll_number: String(row.roll_number ?? '').trim() || null,
      registration_number: String(row.registration_number ?? '').trim() || null,
      transport_type: String(row.transport_type ?? '').trim() || null,
      email: String(row.email ?? '').trim() || null,
      guardian_name: String(row.guardian_name ?? '').trim() || null,
      guardian_phone: String(row.guardian_phone ?? '').trim() || null,
      guardian_email: String(row.guardian_email ?? '').trim() || null,
      class_id: classItem?.id, section_id: sectionItem?.id,
    }
  })
  if (errors.length) throw new Error(errors.slice(0, 12).join('\n') + (errors.length > 12 ? `\nAnd ${errors.length - 12} more issue(s).` : ''))
  const optionalIdsByIndex = rows.map((row, index) => {
    const raw = String(row.optional_subjects ?? '').trim()
    if (!raw) return []
    let requested: string[]
    if (raw.startsWith('[')) {
      try { requested = JSON.parse(raw) as string[] } catch { errors.push(`Row ${index + 2}: optional_subjects must be a JSON list or subject names separated by semicolons.`); return [] }
    } else requested = raw.split(/[;|]/).map((name) => name.trim()).filter(Boolean).map((name) => {
      const match = (allSubjects ?? []).find((subject) => subject.class_id === prepared[index]?.class_id && subject.section_id === prepared[index]?.section_id && subject.name.trim().toLowerCase() === name.toLowerCase())
      if (!match) errors.push(`Row ${index + 2}: optional subject "${name}" is not in the selected class and section.`)
      return match?.id ?? ''
    })
    const validIds = requested.filter((id) => (allSubjects ?? []).some((subject) => subject.id === id && subject.class_id === prepared[index]?.class_id && subject.section_id === prepared[index]?.section_id))
    if (validIds.length !== requested.length) errors.push(`Row ${index + 2}: optional_subjects contains an unknown or out-of-section subject.`)
    return validIds
  })
  if (errors.length) throw new Error(errors.slice(0, 12).join('\n') + (errors.length > 12 ? `\nAnd ${errors.length - 12} more issue(s).` : ''))
  rows.forEach((row, index) => {
    const fee = String(row.active_fee ?? '').trim()
    if (fee && (!Number.isFinite(Number(fee)) || Number(fee) < 0)) errors.push(`Row ${index + 2}: active_fee must be a valid non-negative amount.`)
    for (const key of ['siblings', 'concessions']) {
      const raw = String(row[key] ?? '').trim()
      if (raw) {
        try { JSON.parse(raw) } catch { errors.push(`Row ${index + 2}: ${key} must contain a valid JSON list.`) }
      }
    }
  })
  if (errors.length) throw new Error(errors.slice(0, 12).join('\n') + (errors.length > 12 ? `\nAnd ${errors.length - 12} more issue(s).` : ''))
  const admissions = prepared.filter((row) => row.admission_number).map((row) => row.admission_number as string)
  if (admissions.length) {
    const { data: existing, error } = await supabase.from('students').select('admission_number').eq('org_id', orgId).in('admission_number', admissions)
    if (error) throw new Error(error.message)
    if (existing?.length) throw new Error(`Admission number already exists: ${existing.map((item) => item.admission_number).join(', ')}`)
  }
  const { data: insertedStudents, error } = await supabase.from('students').insert(prepared).select('id, guardian_name, guardian_phone, guardian_email')
  if (error) throw new Error(error.message)

  const admin = createAdminClient()
  const detailKeys = [
    'caste', 'nationality', 'place_of_birth', 'identity_mark', 'pen_no', 'apaar_id', 'student_code', 'religion', 'birth_certificate', 'aadhaar', 'pan', 'blood_group',
    'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country', 'father_name', 'father_phone', 'father_qualification', 'father_occupation', 'father_annual_income', 'father_office_phone', 'father_aadhaar',
    'mother_name', 'mother_phone', 'mother_qualification', 'mother_occupation', 'mother_annual_income', 'mother_office_phone', 'mother_aadhaar', 'guardian_relation', 'guardian_address', 'emergency_contact', 'admission_date',
    'previous_organization', 'previous_institute', 'tc_number', 'previous_class', 'previous_percentage', 'special_needs',
  ]
  const houseNames = [...new Set(rows.map((row) => String(row.house ?? '').trim()).filter(Boolean))]
  const houseIdByName = new Map<string, string>()
  for (const name of houseNames) {
    const { data: existingHouse, error: lookupError } = await admin.from('school_houses').select('id').eq('org_id', orgId).ilike('name', name).maybeSingle()
    if (lookupError) throw new Error(lookupError.message)
    if (existingHouse) houseIdByName.set(name.toLowerCase(), existingHouse.id)
    else {
      const { data: newHouse, error: createError } = await admin.from('school_houses').insert({ org_id: orgId, name }).select('id').single()
      if (createError || !newHouse) throw new Error(createError?.message ?? `Could not create house ${name}.`)
      houseIdByName.set(name.toLowerCase(), newHouse.id)
    }
  }
  const detailRows = (insertedStudents ?? []).map((student, index) => {
    const row = rows[index]
    const details = Object.fromEntries(detailKeys.map((key) => [key, String(row?.[key] ?? '').trim() || null]))
    const parseArray = <T,>(value: string | undefined, fallback: T): T => { if (!value?.trim()) return fallback; try { return JSON.parse(value) as T } catch { throw new Error(`Row ${index + 2}: ${value} is not valid JSON.`) } }
    const activeFeeRaw = String(row?.active_fee ?? '').trim()
    const activeFee = activeFeeRaw ? Number(activeFeeRaw) : null
    if (activeFeeRaw && (!Number.isFinite(activeFee) || activeFee! < 0)) throw new Error(`Row ${index + 2}: active_fee must be a valid non-negative amount.`)
    return {
      org_id: orgId, student_id: student.id, house_id: houseIdByName.get(String(row?.house ?? '').trim().toLowerCase()) ?? null,
      active_fee: activeFee, optional_subjects: optionalIdsByIndex[index],
      details, siblings: parseArray<Array<{ name: string; class: string }>>(row?.siblings, []),
      concessions: parseArray<Array<{ name: string; amount: string; note: string }>>(row?.concessions, []),
      updated_by: user.id, updated_by_email: user.email ?? null,
    }
  })
  if (detailRows.length) {
    const { error: detailsError } = await admin.from('student_details').insert(detailRows)
    if (detailsError) throw new Error(detailsError.message)
  }
  const parentByEmail = new Map<string, { id: string; name: string; phone: string | null; user_id: string | null; status: string }>()
  const parentWarnings: string[] = []
  for (const student of insertedStudents ?? []) {
    const email = String(student.guardian_email ?? '').trim().toLowerCase()
    if (!email) {
      if (student.guardian_name || student.guardian_phone) parentWarnings.push(`${student.guardian_name || 'A guardian'} has no email, so a parent login account could not be created.`)
      continue
    }
    let parent = parentByEmail.get(email)
    if (!parent) {
      const { data: existingParent, error: parentLookupError } = await admin.from('school_parents').select('id, name, phone, user_id, status').eq('org_id', orgId).ilike('email', email).maybeSingle()
      if (parentLookupError) { parentWarnings.push(`Could not look up parent account ${email}: ${parentLookupError.message}`); continue }
      if (existingParent) parent = existingParent
      else {
        const { data: createdParent, error: parentCreateError } = await admin.from('school_parents').insert({ org_id: orgId, name: String(student.guardian_name ?? '').trim() || email, email, phone: String(student.guardian_phone ?? '').trim() || null, status: 'PENDING' }).select('id, name, phone, user_id, status').single()
        if (parentCreateError || !createdParent) { parentWarnings.push(`Could not create parent account ${email}: ${parentCreateError?.message ?? 'Unknown database error'}`); continue }
        parent = createdParent
      }
      if (!parent.user_id) {
        const parentAppUrl = process.env.NEXT_PUBLIC_PARENT_APP_URL ?? '/'
        const parentNext = encodeURIComponent(parentAppUrl)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000'
        const redirectTo = `${siteUrl}/set-password?next=${parentNext}`
        const { data: invitation, error: invitationError } = await admin.auth.admin.inviteUserByEmail(email, {
          data: { full_name: parent.name, role: 'PARENT', org_id: orgId, parent_id: parent.id }, redirectTo,
        })
        let authUserId = invitation?.user?.id ?? null
        let accountConfirmed = false
        if (invitationError && /already\s+(been\s+)?registered/i.test(invitationError.message)) {
          const { data: authUsers, error: authListError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
          if (authListError) parentWarnings.push(`Could not find an existing login for ${email}: ${authListError.message}`)
          else {
            const existingAuth = authUsers.users.find((item) => item.email?.toLowerCase() === email)
            authUserId = existingAuth?.id ?? null
            accountConfirmed = !!existingAuth?.email_confirmed_at
            if (existingAuth && !existingAuth.email_confirmed_at) {
              const { error: passwordLinkError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
              if (passwordLinkError) parentWarnings.push(`Could not send a password setup link to ${email}: ${passwordLinkError.message}`)
            }
          }
        } else if (invitationError) parentWarnings.push(`Could not send the parent invite to ${email}: ${invitationError.message}`)
        if (authUserId) {
          const { error: parentUpdateError } = await admin.from('school_parents').update({ user_id: authUserId, status: accountConfirmed ? 'ACTIVE' : 'PENDING' }).eq('org_id', orgId).eq('id', parent.id)
          if (parentUpdateError) parentWarnings.push(`Parent account ${email} was invited, but its school link needs admin attention.`)
          parent = { ...parent, user_id: authUserId, status: accountConfirmed ? 'ACTIVE' : 'PENDING' }
        }
      }
      parentByEmail.set(email, parent)
    }
    const { error: linkError } = await admin.from('school_parent_students').upsert({ org_id: orgId, parent_id: parent.id, student_id: student.id }, { onConflict: 'org_id,parent_id,student_id', ignoreDuplicates: true })
    if (linkError) parentWarnings.push(`Could not link ${email} to one of the imported students: ${linkError.message}`)
  }
  revalidatePath(`/dashboard/${orgId}/students`)
  return { imported: prepared.length, parentsCreated: parentByEmail.size, parentWarnings: [...new Set(parentWarnings)] }
}

export async function assignStudent(orgId: string, studentId: string, classId: string, sectionId: string) {
  const supabase = await getStudentAccess(orgId)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const { data: section, error: sectionError } = await supabase.from('school_sections').select('id').eq('org_id', orgId).eq('class_id', classId).eq('id', sectionId).maybeSingle()
  if (sectionError || !section) throw new Error(sectionError?.message ?? 'Choose a section within the selected class.')
  const { error } = await supabase.from('students').update({ class_id: classId, section_id: sectionId, updated_by: user.id, updated_by_email: user.email ?? null }).eq('org_id', orgId).eq('id', studentId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/students`)
}
