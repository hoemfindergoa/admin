import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopNav } from "@/components/dashboard-top-nav"
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch current org + all orgs the user can see + the user's staff record (if any)
  const [
    { data: org, error: orgError },
    { data: allOrgs },
    { data: staffRecord },
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),
    supabase.from('organizations').select('id, name, logo_url').order('created_at', { ascending: true }),
    supabase
      .from('organization_users')
      .select('role, permissions, status')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  // Is this user the owner of this org?
  const isOwner = org?.owner_id === user.id

  // Access check: must be owner OR an active/pending staff member
  if (orgError || !org || (!isOwner && !staffRecord)) {
    redirect('/dashboard')
  }

  // Determine permissions:
  // - Owners and franchise admins get ALL permissions (null = unrestricted)
  // - Staff get only what's in their record
  const userPermissions: string[] | null = isOwner || staffRecord?.role === 'FRANCHISE_ADMIN'
    ? null // null = show everything
    : (staffRecord?.permissions as string[]) ?? []

  return (
    <div className="flex min-h-screen w-full bg-muted/40 absolute inset-0 z-50 bg-background">
      <DashboardSidebar
        orgId={orgId}
        permissions={userPermissions}
        isOwner={isOwner}
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 w-full min-w-0 h-screen overflow-y-auto">
        <DashboardTopNav orgId={orgId} orgName={org.name} orgLogo={org.logo_url} allOrgs={allOrgs ?? []} isSuperAdmin={isOwner} />
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-6 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
