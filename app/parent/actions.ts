'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

async function getParentAccess(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const { data: parents, error } = await supabase.from('school_parents').select('id').eq('org_id', orgId).eq('user_id', user.id).eq('status', 'ACTIVE')
  if (error || !parents?.length) throw new Error('You do not have parent access to this school.')
  return { supabase, parentIds: parents.map((parent) => parent.id) }
}

export async function sendParentMessageToTeacher(orgId: string, studentId: string, body: string) {
  const { supabase, parentIds } = await getParentAccess(orgId)
  const message = body.trim()
  if (!message || message.length > 2000) throw new Error('Enter a message up to 2,000 characters.')
  const [{ data: student }, { data: link }] = await Promise.all([
    supabase.from('students').select('id').eq('org_id', orgId).eq('id', studentId).maybeSingle(),
    supabase.from('school_parent_students').select('parent_id').eq('org_id', orgId).eq('student_id', studentId).in('parent_id', parentIds).limit(1).maybeSingle(),
  ])
  if (!student || !link) throw new Error('You can only message teachers about a linked child.')
  const { error } = await supabase.from('school_parent_messages').insert({
    org_id: orgId,
    parent_id: link.parent_id,
    student_id: studentId,
    teacher_id: null,
    sender_role: 'PARENT',
    body: message,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/parent/${orgId}`)
  revalidatePath(`/teacher/${orgId}`)
}
