import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getCrmAccess } from '@/utils/crm-access'
import { ArrowRight, BarChart3, Building2, ChevronRight } from 'lucide-react'

export default async function CrmIndexPage() {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fcrm')

  const access = await getCrmAccess(user.id)

  if (!access.canAccessCrm && !(access.isSuperAdmin && (access.ownedWorkspaces?.length ?? 0) > 0)) {
    redirect('/dashboard')
  }

  // Single workspace — go straight in
  if (access.crmWorkspaceId) {
    redirect(`/crm/${access.crmWorkspaceId}`)
  }

  const workspaces = access.ownedWorkspaces ?? []
  if (!workspaces.length) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white px-6 h-14 flex items-center">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black">
            <BarChart3 className="h-3 w-3 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-zinc-900">Sales CRM</span>
        </div>
        <Link href="/dashboard" className="ml-auto text-[13px] text-zinc-500 hover:text-zinc-900 transition-colors">
          School Dashboard →
        </Link>
      </header>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-[480px]">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Select a workspace</h1>
            <p className="mt-1 text-[14px] text-zinc-500">
              Each workspace is fully isolated. Data is never shared between workspaces.
            </p>
          </div>

          <div className="space-y-2">
            {workspaces.map((ws: any) => (
              <Link
                key={ws.id}
                href={`/crm/${ws.id}`}
                className="group flex items-center gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3.5 shadow-sm transition hover:border-zinc-400 hover:shadow-md"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
                  <Building2 className="h-4 w-4 text-zinc-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-zinc-900 truncate">{ws.name || 'Sales CRM'}</p>
                  <p className="text-[12px] text-zinc-400 font-mono mt-0.5">{ws.id.slice(0, 8)}…</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-700 transition-colors" />
              </Link>
            ))}
          </div>

          <p className="mt-6 text-center text-[12px] text-zinc-400">
            You have super admin access to {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}.
          </p>
        </div>
      </div>
    </div>
  )
}
