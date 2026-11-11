import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ParentPortalWorkspace } from '@/components/parent-portal-workspace'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import Link from 'next/link'
import AuthButton from '@/components/AuthButton'

export default async function ParentSchoolPortal({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: parents, error: parentError } = await supabase.from('school_parents').select('id, name').eq('org_id', orgId).eq('user_id', user.id).eq('status', 'ACTIVE')
  if (parentError || !parents?.length) redirect('/parent')

  const parentIds = parents.map((parent) => parent.id)
  const { data: links, error: linksError } = await supabase.from('school_parent_students').select('student_id').eq('org_id', orgId).in('parent_id', parentIds)
  if (linksError) throw new Error(linksError.message)
  const studentIds = [...new Set((links ?? []).map((link) => link.student_id))]
  const [{ data: org }, { data: students, error: studentsError }] = await Promise.all([
    createAdminClient().from('organizations').select('name, logo_url').eq('id', orgId).maybeSingle(),
    studentIds.length ? supabase.from('students').select('id, student_name, admission_number, class_id, section_id').eq('org_id', orgId).in('id', studentIds).order('student_name') : Promise.resolve({ data: [], error: null }),
  ])
  if (studentsError) throw new Error(studentsError.message)
  const [{ data: classes, error: classesError }, { data: sections, error: sectionsError }, { data: updates, error: updatesError }, { data: messages, error: messagesError }] = await Promise.all([
    studentIds.length ? supabase.from('school_classes').select('id, name').eq('org_id', orgId) : Promise.resolve({ data: [], error: null }),
    studentIds.length ? supabase.from('school_sections').select('id, name, class_id').eq('org_id', orgId) : Promise.resolve({ data: [], error: null }),
    supabase.from('school_class_updates').select('id, class_id, section_id, kind, title, body, due_date, created_at').eq('org_id', orgId).order('created_at', { ascending: false }).limit(100),
    studentIds.length ? supabase.from('school_parent_messages').select('id, student_id, sender_role, body, created_at').eq('org_id', orgId).in('student_id', studentIds).order('created_at', { ascending: true }) : Promise.resolve({ data: [], error: null }),
  ])
  if (classesError || sectionsError || updatesError || messagesError) throw new Error(classesError?.message ?? sectionsError?.message ?? updatesError?.message ?? messagesError?.message)

  return <div><header className="flex h-14 items-center justify-between border-b px-4 sm:px-6"><Link href="/parent" className="text-sm font-semibold text-base-content/70 hover:text-base-content">Family portal</Link><AuthButton /></header><ParentPortalWorkspace orgId={orgId} orgName={org?.name ?? 'School'} logoUrl={org?.logo_url} parentName={parents[0]?.name ?? ''} students={students ?? []} classes={classes ?? []} sections={sections ?? []} updates={updates ?? []} messages={messages ?? []} /></div>
}
