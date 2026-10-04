'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getCommunicationAccess(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const [{ data: org }, { data: member }, { data: teacher }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
    supabase.from('school_teachers').select('status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (member?.role === 'FRANCHISE_ADMIN' || (
    Array.isArray(member.permissions) && (member.permissions.includes('communication') || member.permissions.includes('manage_school') || member.permissions.includes('teacher'))
  ))) || teacher?.status === 'ACTIVE'
  if (!allowed) throw new Error('You do not have permission to manage communications.')
  return { supabase, user }
}

export async function getCommunicationWorkspace(orgId: string) {
  const { supabase, user } = await getCommunicationAccess(orgId)
  
  // Get all students and their parents for the directory
  const { data: studentsData, error: studentError } = await supabase
    .from('students')
    .select(`
      id, student_name, admission_number, class_id, section_id,
      school_classes (name),
      school_sections (name)
    `)
    .eq('org_id', orgId)
    .order('student_name')
    
  if (studentError) throw new Error(studentError.message)
    
  const { data: parentsData } = await supabase
    .from('school_parent_students')
    .select('student_id, parent_id, school_parents(id, name, email, phone)')
    .eq('org_id', orgId)
    
  // Get all teachers for the dropdown to act on behalf of
  const { data: teachersData } = await supabase
    .from('school_teachers')
    .select('id, name, user_id')
    .eq('org_id', orgId)
    .order('name')
    
  return {
    students: studentsData || [],
    parents: parentsData || [],
    teachers: teachersData || [],
    currentUserId: user.id
  }
}

export async function getStudentMessages(orgId: string, studentId: string) {
  const { supabase } = await getCommunicationAccess(orgId)
  const { data: messages, error } = await supabase
    .from('school_parent_messages')
    .select('*')
    .eq('org_id', orgId)
    .eq('student_id', studentId)
    .order('created_at', { ascending: true })
    
  if (error) throw new Error(error.message)
  return messages || []
}

export async function sendMessage(orgId: string, studentId: string, parentId: string, teacherId: string | null, body: string) {
  await getCommunicationAccess(orgId)
  
  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('school_parent_messages')
    .insert({
      org_id: orgId,
      student_id: studentId,
      parent_id: parentId,
      teacher_id: teacherId, // null if sent by admin directly
      sender_role: 'TEACHER', // Even admin sends as 'TEACHER' role in schema
      body: body.trim()
    })
    
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/communication`)
}
