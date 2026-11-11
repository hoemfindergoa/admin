import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { SchoolToolsWorkspace } from '@/components/school-tools-workspace'
import { createClient } from '@/utils/supabase/server'

export default async function SchoolToolsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('id, owner_id, name, logo_url').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (
    member.role === 'FRANCHISE_ADMIN' || (Array.isArray(member.permissions) && (member.permissions.includes('students') || member.permissions.includes('manage_school')))
  ))
  if (!org || !allowed) redirect(`/dashboard/${orgId}`)

  const [{ data: students, error: studentsError }, { data: classes, error: classesError }, { data: sections, error: sectionsError }] = await Promise.all([
    supabase.from('students').select('id, student_name, admission_number, date_of_birth, guardian_name, guardian_phone, class_id, section_id, status').eq('org_id', orgId).order('student_name'),
    supabase.from('school_classes').select('id, name').eq('org_id', orgId).order('sort_order').order('name'),
    supabase.from('school_sections').select('id, class_id, name').eq('org_id', orgId).order('name'),
  ])
  if (studentsError || classesError || sectionsError) throw new Error(studentsError?.message ?? classesError?.message ?? sectionsError?.message)

  return <SchoolToolsWorkspace orgName={org.name} logoUrl={org.logo_url} students={students ?? []} classes={classes ?? []} sections={sections ?? []} />
}
