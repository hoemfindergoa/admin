import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { AdmissionWorkspace } from '@/components/admission-workspace'

export default async function AdmissionPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = createClient(await cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])

  const isOwner = org?.owner_id === user.id
  const isAdmin = isOwner || member?.role === 'FRANCHISE_ADMIN'
  const hasAccess = isAdmin || (Array.isArray(member?.permissions) && member?.permissions.includes('students'))

  if (!hasAccess) {
    return <div className="p-8"><p className="text-muted-foreground text-sm">You do not have permission to view this page.</p></div>
  }

  // Fetch classes for the classroom multi-select
  let { data: classes } = await supabase.from('school_classes').select('id, name, sort_order').eq('org_id', orgId).order('sort_order').order('name')

  if (!classes || classes.length === 0) {
    // Fallback to the requested default classes if none are configured yet
    classes = [
      { id: 'lkg', name: 'LKG', sort_order: 1 },
      { id: 'nursery', name: 'NURSERY', sort_order: 2 },
      { id: 'play-school', name: 'Play School', sort_order: 3 },
      { id: 'pre-nursery', name: 'Pre Nursery', sort_order: 4 },
      { id: 'ukg', name: 'UKG', sort_order: 5 },
      { id: '1', name: 'Class 1', sort_order: 6 },
      { id: '2', name: 'Class 2', sort_order: 7 },
      { id: '3', name: 'Class 3', sort_order: 8 },
      { id: '4', name: 'Class 4', sort_order: 9 },
      { id: '5', name: 'Class 5', sort_order: 10 },
    ]
  }

  // Try to fetch existing admission forms. 
  // If the table doesn't exist yet, this will fail gracefully and return an empty array.
  const admin = createAdminClient()
  const { data: formsData, error } = await admin
    .from('school_admission_forms')
    .select('id, name, deadline, classes')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching forms:", error)
  }

  const forms = formsData || []

  return (
    <div className="w-full max-w-[1800px] mx-auto py-8">
      <AdmissionWorkspace orgId={orgId} classes={classes || []} forms={forms} />
    </div>
  )
}
