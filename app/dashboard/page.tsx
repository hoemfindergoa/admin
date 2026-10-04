import { getOrganizations } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Banknote, BookOpen, Building2, GraduationCap, Plus, Users } from "lucide-react"
import Link from 'next/link'
import { CreateFranchiseSheet } from '@/components/create-franchise-sheet'
import { EditFranchiseSheet } from '@/components/edit-franchise-sheet'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'

export default async function DashboardRootPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  // The RLS-visible organization list also includes staff memberships, so
  // derive super-admin status from the real owner_id instead of visibility.
  const visibleOrganizations = await getOrganizations()
  const ownedOrgs = visibleOrganizations.filter((org: any) => org.owner_id === user?.id)
  const ownedOrgIds = new Set(ownedOrgs.map((o: any) => o.id))

  // Orgs this user is a staff member of
  const { data: staffRows } = await supabase
    .from('organization_users')
    .select('org_id, role, permissions, status, organizations(id, name, course_type, affiliation, email, phone, session_start_date, session_end_date, logo_url)')
    .eq('user_id', user?.id ?? '')
    .eq('status', 'ACTIVE')

  const staffOrgs = (staffRows ?? [])
    .map((r: any) => r.organizations)
    .filter(Boolean)
    .filter((o: any) => !ownedOrgIds.has(o.id)) // don't duplicate

  const isOwner = ownedOrgs.length > 0

  const allOrgs = [...ownedOrgs, ...staffOrgs]
  const visibleOrgIds = allOrgs.map((org: any) => org.id)
  const financialOrgIds = [...new Set([
    ...ownedOrgIds,
    ...(staffRows ?? []).filter((row: any) => row.status === 'ACTIVE' && (row.role === 'FRANCHISE_ADMIN' || (Array.isArray(row.permissions) && row.permissions.includes('fees')))).map((row: any) => row.org_id),
  ])]

  let dashboardTotals: { students: number | null; teachers: number | null; classes: number | null; revenue: number | null; financial: boolean } | null = null
  if (visibleOrgIds.length) {
    const admin = createAdminClient()
    const [{ count: students, error: studentsError }, { data: teachers, error: teachersError }, { count: classes, error: classesError }] = await Promise.all([
      admin.from('students').select('id', { count: 'exact', head: true }).in('org_id', visibleOrgIds),
      admin.from('school_teachers').select('status').in('org_id', visibleOrgIds),
      admin.from('school_classes').select('id', { count: 'exact', head: true }).in('org_id', visibleOrgIds),
    ])
    let revenue: number | null = null
    const canSeeFinance = financialOrgIds.length > 0
    if (canSeeFinance) {
      const { data: payments, error } = await admin.from('school_fee_payments').select('amount').in('org_id', financialOrgIds)
      if (!error) revenue = (payments ?? []).reduce((sum, item) => sum + Number(item.amount), 0)
    }
    dashboardTotals = {
      students: studentsError ? null : students ?? 0,
      teachers: teachersError ? null : (teachers ?? []).filter((teacher) => teacher.status === 'ACTIVE').length,
      classes: classesError ? null : classes ?? 0,
      revenue,
      financial: canSeeFinance,
    }
  }
  const money = (amount: number | null) => amount == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  if (allOrgs.length === 0 && user) {
    const crmAccess = await getCrmAccess(user.id)
    if (crmAccess.isCrmMember) redirect('/crm')
    const { data: teacherProfiles } = await supabase.from('school_teachers').select('org_id').eq('user_id', user.id).eq('status', 'ACTIVE').order('created_at').limit(1)
    if (teacherProfiles?.[0]) redirect(`/teacher/${teacherProfiles[0].org_id}`)
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1800px] mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Your Franchises</h1>
          <p className="text-[14px] text-zinc-500 mt-1 font-medium">
            Manage all your school branches from one central hub.
          </p>
        </div>
        {isOwner && (
          <div className="flex items-center gap-3">
            <Link href="/crm">
              <Button variant="outline" className="text-zinc-600 border-zinc-200 hover:bg-zinc-50 transition-colors shadow-sm font-semibold">
                Switch to Sales CRM
              </Button>
            </Link>
            <CreateFranchiseSheet />
          </div>
        )}
      </div>

      {dashboardTotals && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
            <h2 className="text-[16px] font-bold text-zinc-900 tracking-tight">Franchise network totals</h2>
            <p className="text-[13px] text-zinc-500 mt-1 font-medium">Live totals across the franchises you can access.</p>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100">
            {/* Students */}
            <div className="p-6 bg-white hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100/80 text-indigo-600 shadow-sm ring-1 ring-indigo-200/50">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 text-sm">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Students</span>
                  <p className="text-2xl font-bold text-zinc-900 tracking-tight">{dashboardTotals.students ?? '—'}</p>
                </div>
              </div>
            </div>
            {/* Teachers */}
            <div className="p-6 bg-white hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-600 shadow-sm ring-1 ring-emerald-200/50">
                  <Users className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 text-sm">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Active Teachers</span>
                  <p className="text-2xl font-bold text-zinc-900 tracking-tight">{dashboardTotals.teachers ?? '—'}</p>
                </div>
              </div>
            </div>
            {/* Classes */}
            <div className="p-6 bg-white hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600 shadow-sm ring-1 ring-amber-200/50">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="space-y-0.5 text-sm">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Classes</span>
                  <p className="text-2xl font-bold text-zinc-900 tracking-tight">{dashboardTotals.classes ?? '—'}</p>
                </div>
              </div>
            </div>
            {/* Revenue */}
            {dashboardTotals.financial && (
              <div className="p-6 bg-white hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100/80 text-rose-600 shadow-sm ring-1 ring-rose-200/50">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 text-sm">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Collected Revenue</span>
                    <p className="text-2xl font-bold text-zinc-900 tracking-tight">{money(dashboardTotals.revenue)}</p>
                  </div>
                </div>
              </div>
            )}
            {dashboardTotals.financial && dashboardTotals.revenue == null && (
              <div className="p-4 sm:col-span-2 lg:col-span-4 bg-amber-50 border-t border-amber-100">
                <p className="text-[12px] font-medium text-amber-700">
                  Apply the financial ledger section in schema_school_management.sql to enable recorded payment totals.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {allOrgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-200 border-dashed rounded-2xl bg-zinc-50/50 shadow-sm">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm ring-1 ring-zinc-200">
            <Building2 className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">No franchises yet</h2>
          <p className="text-[14px] text-zinc-500 mt-2 max-w-sm font-medium">
            You haven't created any school franchises yet. Create your first organization to access the management dashboard.
          </p>
          <div className="mt-6">
            <CreateFranchiseSheet
              trigger={
                <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-colors rounded-full font-semibold px-6">
                  <Plus className="w-5 h-5" />
                  Create your first Franchise
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allOrgs.map((org: any) => {
            const userOwnsOrg = ownedOrgIds.has(org.id)
            return (
              <div key={org.id} className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all overflow-hidden group">
                <div className="flex flex-row items-start justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/30">
                  <div className="flex items-center gap-3">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name} className="h-10 w-10 shrink-0 rounded-lg object-contain bg-white ring-1 ring-zinc-200/50 p-0.5" />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 flex items-center justify-center ring-1 ring-zinc-200/50">
                        <Building2 className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h3 className="text-[17px] font-bold text-zinc-900 tracking-tight">{org.name}</h3>
                      <p className="text-[13px] font-medium text-zinc-500">{org.course_type} • {org.affiliation || 'No Affiliation'}</p>
                    </div>
                  </div>
                  {userOwnsOrg && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditFranchiseSheet org={org} />
                    </div>
                  )}
                </div>
                <div className="flex-1 px-6 py-5">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Email</span>
                      <p className="font-semibold text-zinc-700 truncate">{org.email || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Phone</span>
                      <p className="font-semibold text-zinc-700 truncate">{org.phone || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Session Start</span>
                      <p className="font-semibold text-zinc-700 truncate">{org.session_start_date || '—'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Session End</span>
                      <p className="font-semibold text-zinc-700 truncate">{org.session_end_date || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
                  <Link href={`/dashboard/${org.id}`} className="w-full">
                    <Button className="w-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors font-semibold rounded-xl">
                      Open Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
