import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { EditFranchiseSheet } from '@/components/edit-franchise-sheet'
import { Button } from '@/components/ui/button'

export default async function SettingsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = createClient(await cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])

  if (!org) redirect('/dashboard')

  const isOwner = org.owner_id === user.id
  const isAdmin = isOwner || member?.role === 'FRANCHISE_ADMIN'

  if (!isAdmin) {
    return <div className="p-8"><p className="text-muted-foreground text-sm">You do not have permission to view this page.</p></div>
  }

  return (
    <div className="w-full max-w-[800px] mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Franchise Settings</h1>
        <p className="mt-1 text-[14px] font-medium text-zinc-500">Update franchise details, logo, and configuration.</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Franchise Information</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-[13px] font-bold text-zinc-500 uppercase tracking-wider">Name</label>
            <p className="text-[15px] font-medium text-zinc-900">{org.name}</p>
          </div>
          {org.logo_url && (
            <div>
              <label className="text-[13px] font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Logo</label>
              <img src={org.logo_url} alt={org.name} className="h-20 w-20 rounded-xl object-contain bg-zinc-50 border border-zinc-100 p-1" />
            </div>
          )}
          <div className="pt-4">
            <EditFranchiseSheet 
              org={org} 
              trigger={<Button variant="outline" className="border-zinc-200 shadow-sm text-sm font-semibold">Edit Franchise Details</Button>}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
