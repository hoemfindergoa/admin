'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getTeacher(supabase: ReturnType<typeof createClient>, orgId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in.')
  const { data: teacher, error } = await supabase.from('school_teachers').select('id, org_id, user_id, name, email, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle()
  if (error || !teacher) throw new Error('This account does not have an active teacher profile for this school.')
  return teacher
}

export async function getTeacherClassroom(orgId: string) {
  const supabase = createClient(await cookies())
  const teacher = await getTeacher(supabase, orgId)
  const [{ data: classAssignments, error: classError }, { data: subjectAssignments, error: subjectError }, { data: students, error: studentError }, { data: org }] = await Promise.all([
    supabase.from('school_class_teachers').select('class_id').eq('org_id', orgId).eq('teacher_id', teacher.id),
    supabase.from('school_subject_teachers').select('subject_id').eq('org_id', orgId).eq('teacher_id', teacher.id),
    supabase.from('students').select('id, student_name, admission_number, guardian_name, guardian_phone, guardian_email, class_id, section_id').eq('org_id', orgId).order('student_name'),
    createAdminClient().from('organizations').select('name').eq('id', orgId).maybeSingle(),
  ])
  if (classError || subjectError || studentError) throw new Error(classError?.message ?? subjectError?.message ?? studentError?.message)
  const subjectIds = (subjectAssignments ?? []).map((item) => item.subject_id)
  const { data: assignedSubjects, error: assignedSubjectsError } = subjectIds.length
    ? await supabase.from('school_subjects').select('id, class_id, section_id, name').eq('org_id', orgId).in('id', subjectIds)
    : { data: [], error: null }
  if (assignedSubjectsError) throw new Error(assignedSubjectsError.message)
  const classIds = new Set((classAssignments ?? []).map((item) => item.class_id))
  for (const subject of assignedSubjects ?? []) classIds.add(subject.class_id)
  const [{ data: classes, error: classesError }, { data: sections, error: sectionsError }] = await Promise.all([
    classIds.size ? supabase.from('school_classes').select('id, name').eq('org_id', orgId).in('id', [...classIds]).order('name') : Promise.resolve({ data: [], error: null }),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
  ])
  if (classesError || sectionsError) throw new Error(classesError?.message ?? sectionsError?.message)
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
  return { teacher, orgName: org?.name ?? 'School', classes: classes ?? [], sections: sections ?? [], subjects: assignedSubjects ?? [], students: visibleStudents, parents: parents ?? [], parentLinks: parentLinks ?? [], messages: messages ?? [] }
}

export async function sendParentMessage(orgId: string, studentId: string, body: string) {
  const supabase = createClient(await cookies())
  const teacher = await getTeacher(supabase, orgId)
  const messageBody = body.trim()
  if (!messageBody || messageBody.length > 2000) throw new Error('Enter a message up to 2,000 characters.')
  const { data: student, error: studentError } = await supabase.from('students').select('id').eq('org_id', orgId).eq('id', studentId).maybeSingle()
  if (studentError || !student) throw new Error(studentError?.message ?? 'This student is not assigned to you.')
  const { data: parentLink, error: linkError } = await supabase.from('school_parent_students').select('parent_id').eq('org_id', orgId).eq('student_id', studentId).limit(1).maybeSingle()
  if (linkError || !parentLink) throw new Error(linkError?.message ?? 'No parent account is linked to this student yet.')
  const { error } = await supabase.from('school_parent_messages').insert({ org_id: orgId, parent_id: parentLink.parent_id, student_id: studentId, teacher_id: teacher.id, sender_role: 'TEACHER', body: messageBody })
  if (error) throw new Error(error.message)
  revalidatePath(`/teacher/${orgId}`)
}
