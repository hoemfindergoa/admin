import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { HostelWorkspace } from '@/components/hostel-workspace'

export default async function HostelPage({ params }: { params: Promise<{ orgId: string }> }) {
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
  const hasAccess = isAdmin || (Array.isArray(member?.permissions) && member?.permissions.includes('hostel'))

  if (!hasAccess) {
    return <div className="p-8"><p className="text-muted-foreground text-sm">You do not have permission to view this page.</p></div>
  }

  // Use admin client to bypass potential RLS if tables were just created
  const admin = createAdminClient()
  const { data: hostelsData, error } = await admin
    .from('school_hostels')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching hostels:", error)
  }

  const hostels = hostelsData || []

  return (
    <div className="w-full max-w-[1800px] mx-auto py-8">
      <HostelWorkspace orgId={orgId} hostels={hostels} />
    </div>
  )
}
