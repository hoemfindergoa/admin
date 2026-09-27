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

export default async function DashboardRootPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  // Orgs this user owns
  const ownedOrgs = await getOrganizations()
  const ownedOrgIds = new Set(ownedOrgs.map((o: any) => o.id))

  // Orgs this user is a staff member of
  const { data: staffRows } = await supabase
    .from('organization_users')
    .select('org_id, role, permissions, status, organizations(id, name, course_type, affiliation, email, phone, session_start_date, session_end_date)')
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
    const { data: teacherProfiles } = await supabase.from('school_teachers').select('org_id').eq('user_id', user.id).order('created_at').limit(1)
    if (teacherProfiles?.[0]) redirect(`/teacher/${teacherProfiles[0].org_id}`)
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Franchises</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your school branches from one central hub.
          </p>
        </div>
        {isOwner && <CreateFranchiseSheet />}
      </div>

      {dashboardTotals && <Card><CardHeader><CardTitle>Franchise network totals</CardTitle><CardDescription>Live totals across the franchises you can access.</CardDescription></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4"><div className="flex items-center justify-between text-sm text-muted-foreground">Students<GraduationCap className="h-4 w-4" /></div><p className="mt-2 text-2xl font-bold">{dashboardTotals.students ?? '—'}</p></div>
        <div className="rounded-lg border p-4"><div className="flex items-center justify-between text-sm text-muted-foreground">Active teachers<Users className="h-4 w-4" /></div><p className="mt-2 text-2xl font-bold">{dashboardTotals.teachers ?? '—'}</p></div>
        <div className="rounded-lg border p-4"><div className="flex items-center justify-between text-sm text-muted-foreground">Classes<BookOpen className="h-4 w-4" /></div><p className="mt-2 text-2xl font-bold">{dashboardTotals.classes ?? '—'}</p></div>
        {dashboardTotals.financial && <div className="rounded-lg border p-4"><div className="flex items-center justify-between text-sm text-muted-foreground">Collected revenue<Banknote className="h-4 w-4" /></div><p className="mt-2 text-2xl font-bold">{money(dashboardTotals.revenue)}</p></div>}
        {dashboardTotals.financial && dashboardTotals.revenue == null && <p className="text-xs text-amber-700 sm:col-span-2 lg:col-span-4">Apply the financial ledger section in schema_school_management.sql to enable recorded payment totals.</p>}
      </CardContent></Card>}

      {allOrgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/10">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">No franchises yet</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            You haven't created any school franchises yet. Create your first organization to access the management dashboard.
          </p>
          <div className="mt-8">
            <CreateFranchiseSheet
              trigger={
                <Button size="lg" className="gap-2">
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
              <Card key={org.id} className="flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-semibold">{org.name}</CardTitle>
                    <CardDescription>{org.course_type} • {org.affiliation || 'No Affiliation'}</CardDescription>
                  </div>
                  {userOwnsOrg && <EditFranchiseSheet org={org} />}
              </CardHeader>
                <CardContent className="flex-1 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Email</span>
                      <p className="font-medium truncate">{org.email || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Phone</span>
                      <p className="font-medium truncate">{org.phone || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Session Start</span>
                      <p className="font-medium truncate">{org.session_start_date || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Session End</span>
                      <p className="font-medium truncate">{org.session_end_date || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Link href={`/dashboard/${org.id}`} className="w-full">
                    <Button variant="secondary" className="w-full text-primary">
                      Open Dashboard
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
