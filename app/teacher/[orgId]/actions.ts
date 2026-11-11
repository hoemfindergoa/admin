'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getTeacher(supabase: ReturnType<typeof createClient>, orgId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in.')
  const { data: teacher, error } = await supabase.from('school_teachers').select('id, org_id, user_id, name, email, status').eq('org_id', orgId).eq('user_id', user.id).eq('status', 'ACTIVE').maybeSingle()
  if (error || !teacher) throw new Error('This account does not have an active teacher profile for this school.')
  return teacher
}

export async function getTeacherClassroom(orgId: string) {
  const supabase = createClient(await cookies())
  const teacher = await getTeacher(supabase, orgId)
  const [{ data: subjectAssignments, error: subjectError }, { data: assignedSections, error: sectionsError }, { data: students, error: studentError }, { data: org }] = await Promise.all([
    supabase.from('school_subject_teachers').select('subject_id').eq('org_id', orgId).eq('teacher_id', teacher.id),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
    supabase.from('students').select('id, student_name, admission_number, guardian_name, guardian_phone, guardian_email, class_id, section_id').eq('org_id', orgId).order('student_name'),
    createAdminClient().from('organizations').select('name').eq('id', orgId).maybeSingle(),
  ])
  if (subjectError || sectionsError || studentError) throw new Error(subjectError?.message ?? sectionsError?.message ?? studentError?.message)
  const subjectIds = (subjectAssignments ?? []).map((item) => item.subject_id)
  const { data: assignedSubjects, error: assignedSubjectsError } = subjectIds.length
    ? await supabase.from('school_subjects').select('id, class_id, section_id, name').eq('org_id', orgId).in('id', subjectIds)
    : { data: [], error: null }
  if (assignedSubjectsError) throw new Error(assignedSubjectsError.message)
  const classIds = new Set<string>()
  for (const section of assignedSections ?? []) classIds.add(section.class_id)
  for (const subject of assignedSubjects ?? []) classIds.add(subject.class_id)
  const classResult = classIds.size
    ? await supabase.from('school_classes').select('id, name').eq('org_id', orgId).in('id', [...classIds]).order('name')
    : { data: [], error: null }
  const { data: classes, error: classesError } = classResult
  if (classesError) throw new Error(classesError.message)
  const visibleStudents = students ?? []
  const studentIds = visibleStudents.map((item) => item.id)
  const { data: parentLinks, error: linkError } = studentIds.length
    ? await supabase.from('school_parent_students').select('student_id, parent_id').eq('org_id', orgId).in('student_id', studentIds)
    : { data: [], error: null }
  if (linkError) throw new Error(linkError.message)
  const parentIds = [...new Set((parentLinks ?? []).map((item) => item.parent_id))]
  const { data: parents, error: parentError } = parentIds.length
    ? await supabase.from('school_parents').select('id, name, email, phone').eq('org_id', orgId).in('id', parentIds)
    : { data: [], error: null }
  if (parentError) throw new Error(parentError.message)
  const { data: messages, error: messageError } = studentIds.length
    ? await supabase.from('school_parent_messages').select('id, parent_id, student_id, sender_role, body, created_at').eq('org_id', orgId).in('student_id', studentIds).order('created_at')
    : { data: [], error: null }
  if (messageError) throw new Error(messageError.message)
  const { data: classUpdates, error: updatesError } = await supabase.from('school_class_updates').select('id, class_id, section_id, teacher_id, kind, title, body, due_date, created_at').eq('org_id', orgId).order('created_at', { ascending: false }).limit(100)
  if (updatesError) throw new Error(updatesError.message)
  return { teacher, orgName: org?.name ?? 'School', classes: classes ?? [], sections: assignedSections ?? [], subjects: assignedSubjects ?? [], students: visibleStudents, parents: parents ?? [], parentLinks: parentLinks ?? [], messages: messages ?? [], classUpdates: classUpdates ?? [] }
}

export async function sendParentMessage(orgId: string, studentId: string, body: string) {
  const supabase = createClient(await cookies())
  const teacher = await getTeacher(supabase, orgId)
  const messageBody = body.trim()
  if (!messageBody || messageBody.length > 2000) throw new Error('Enter a message up to 2,000 characters.')
  const { data: student, error: studentError } = await supabase.from('students').select('id').eq('org_id', orgId).eq('id', studentId).maybeSingle()
  if (studentError || !student) throw new Error(studentError?.message ?? 'This student is not assigned to you.')
  const { data: parentLinks, error: linkError } = await supabase.from('school_parent_students').select('parent_id').eq('org_id', orgId).eq('student_id', studentId)
  if (linkError || !parentLinks?.length) throw new Error(linkError?.message ?? 'No parent account is linked to this student yet.')
  const { error } = await supabase.from('school_parent_messages').insert(parentLinks.map((parentLink) => ({ org_id: orgId, parent_id: parentLink.parent_id, student_id: studentId, teacher_id: teacher.id, sender_role: 'TEACHER', body: messageBody })))
  if (error) throw new Error(error.message)
  revalidatePath(`/teacher/${orgId}`)
  revalidatePath(`/parent/${orgId}`)
}

export async function createTeacherClassUpdate(orgId: string, formData: FormData) {
  const supabase = createClient(await cookies())
  const teacher = await getTeacher(supabase, orgId)
  const classId = String(formData.get('class_id') ?? '').trim()
  const sectionValue = String(formData.get('section_id') ?? '').trim()
  const sectionId = sectionValue && sectionValue !== 'ALL' ? sectionValue : null
  const kind = String(formData.get('kind') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const dueDate = String(formData.get('due_date') ?? '').trim() || null
  if (!['HOMEWORK', 'MOTIVATION'].includes(kind)) throw new Error('Choose homework or a motivation note.')
  if (!classId || !sectionId || !title || !body) throw new Error('Choose a class and section, then enter a title and details.')
  if (title.length > 120 || body.length > 5000) throw new Error('Keep the title under 120 characters and details under 5,000 characters.')
  if (kind === 'HOMEWORK' && dueDate && Number.isNaN(Date.parse(dueDate))) throw new Error('Choose a valid due date.')

  const { data: assignedClass, error: classError } = await supabase.from('school_classes').select('id').eq('org_id', orgId).eq('id', classId).maybeSingle()
  if (classError || !assignedClass) throw new Error(classError?.message ?? 'You are not assigned to this class.')
  const { data: assignedSection, error: sectionError } = await supabase.from('school_sections').select('id').eq('org_id', orgId).eq('class_id', classId).eq('id', sectionId).maybeSingle()
  if (sectionError || !assignedSection) throw new Error(sectionError?.message ?? 'You are not assigned to this section.')

  const { error } = await supabase.from('school_class_updates').insert({
    org_id: orgId,
    class_id: classId,
    section_id: sectionId,
    teacher_id: teacher.id,
    kind,
    title,
    body,
    due_date: kind === 'HOMEWORK' ? dueDate : null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/teacher/${orgId}`)
  revalidatePath(`/parent/${orgId}`)
}
