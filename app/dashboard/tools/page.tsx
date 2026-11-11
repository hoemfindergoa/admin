import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ArrowRight, Building2, School, Wrench } from 'lucide-react'
import { getOrganizations } from '../actions'
import { createClient } from '@/utils/supabase/server'

export default async function SchoolToolsHubPage() {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [allOrgs, { data: memberships }] = await Promise.all([
    getOrganizations(),
    supabase.from('organization_users').select('org_id, role, permissions, status').eq('user_id', user.id).eq('status', 'ACTIVE'),
  ])
  const membershipByOrg = new Map((memberships ?? []).map((item: any) => [item.org_id, item]))
  const organizations = allOrgs.filter((org: any) => {
    if (org.owner_id === user.id) return true
    const member: any = membershipByOrg.get(org.id)
    return member?.role === 'FRANCHISE_ADMIN' || (Array.isArray(member?.permissions) && (member.permissions.includes('students') || member.permissions.includes('manage_school')))
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">School workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">School tools</h1>
        <p className="mt-2 max-w-2xl text-sm text-base-content/70">Choose a school to make ID cards, certificates, and class contact sheets from its student records.</p>
      </header>
      {organizations.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {organizations.map((org: any) => (
            <Link key={org.id} href={`/dashboard/${org.id}/tools`} className="card card-border bg-base-100 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <div className="card-body flex-row items-center gap-4 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">{org.logo_url ? <img src={org.logo_url} alt="" className="h-10 w-10 rounded-lg object-contain" /> : <School className="h-6 w-6" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{org.name}</span><span className="mt-1 block text-sm text-base-content/65">Open school tools</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-base-content/50" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card card-border bg-base-100"><div className="card-body items-center py-12 text-center"><Building2 className="h-9 w-9 text-base-content/35" /><h2 className="card-title mt-2">No school access found</h2><p className="max-w-md text-sm text-base-content/65">School tools are available to franchise owners and staff with student or school-management access.</p></div></div>
      )}
      <div className="alert alert-info"><Wrench className="h-5 w-5" /><span>Tools use the selected school’s student records and do not change student data.</span></div>
    </div>
  )
}
