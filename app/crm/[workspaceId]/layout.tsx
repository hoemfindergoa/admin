import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCrmAccess } from '@/utils/crm-access'
import { CrmShell } from '@/components/crm-shell'

export default async function CrmWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=%2Fcrm%2F${workspaceId}`)

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) redirect('/crm')

  return (
    <CrmShell
      workspaceId={workspaceId}
      isSuperAdmin={access.isSuperAdmin}
      role={access.crmUser?.role ?? 'SUPER_ADMIN'}
      name={access.crmUser?.name ?? user.user_metadata?.full_name ?? user.email ?? 'CRM user'}
    >
      {children}
    </CrmShell>
  )
}
