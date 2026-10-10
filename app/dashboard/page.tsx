import { getOrganizations } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Banknote, BookOpen, Building2, GraduationCap, Plus, Users, Package } from "lucide-react"
import Link from 'next/link'
import { CreateFranchiseSheet } from '@/components/create-franchise-sheet'
import { EditFranchiseSheet } from '@/components/edit-franchise-sheet'
import { FranchiseList } from '@/components/franchise-list'
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
        <div className="flex items-center gap-4">
          {isOwner && (
            <CreateFranchiseSheet />
          )}
        </div>
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

      <FranchiseList allOrgs={allOrgs} ownedOrgIds={Array.from(ownedOrgIds)} />
    </div>
  )
}
