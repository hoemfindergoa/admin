import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Banknote, BookOpen, Building2, GraduationCap, Receipt, School, Users } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function Metric({ title, value, note, icon: Icon }: { title: string; value: string; note?: string; icon: typeof Users }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{value}</div>{note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}</CardContent></Card>
}

export default async function FranchiseDashboardPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('id, name, owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const isOwner = org?.owner_id === user.id
  if (!org || (!isOwner && member?.status !== 'ACTIVE')) redirect('/dashboard')
  const isAdmin = isOwner || member?.role === 'FRANCHISE_ADMIN'
  const permissions = Array.isArray(member?.permissions) ? member?.permissions as string[] : []
  const canSeeFinance = isAdmin || permissions.includes('fees')
  const canSeeExpenses = isAdmin || permissions.includes('expenses')
  const canSeeStudents = isAdmin || permissions.includes('students') || permissions.includes('manage_school')
  const canManageSchool = isAdmin || permissions.includes('manage_school')

  // Use the authenticated organization check above, then count this franchise's records server-side.
  const admin = createAdminClient()
  const [{ count: studentCount }, { data: teachers }, { count: classCount }, { count: sectionCount }] = await Promise.all([
    admin.from('students').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    admin.from('school_teachers').select('status').eq('org_id', orgId),
    admin.from('school_classes').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    admin.from('school_sections').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
  ])
  const activeTeachers = teachers?.filter((teacher) => teacher.status === 'ACTIVE').length ?? 0
  const pendingTeachers = teachers?.filter((teacher) => teacher.status === 'PENDING').length ?? 0

  let collectedTotal: number | null = null
  let collectedMonth: number | null = null
  let paymentLedgerReady = true
  if (canSeeFinance) {
    const { data: payments, error } = await admin.from('school_fee_payments').select('amount, payment_date').eq('org_id', orgId)
    if (error) paymentLedgerReady = false
    else {
      const current = new Date()
      const month = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      collectedTotal = (payments ?? []).reduce((sum, item) => sum + Number(item.amount), 0)
      collectedMonth = (payments ?? []).filter((item) => item.payment_date.startsWith(month)).reduce((sum, item) => sum + Number(item.amount), 0)
    }
  }
  let expenseTotal: number | null = null
  let expenseMonth: number | null = null
  let expenseLedgerReady = true
  if (canSeeExpenses) {
    const { data: expenses, error } = await admin.from('school_expenses').select('amount, expense_date').eq('org_id', orgId)
    if (error) expenseLedgerReady = false
    else {
      const current = new Date()
      const month = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      expenseTotal = (expenses ?? []).reduce((sum, item) => sum + Number(item.amount), 0)
      expenseMonth = (expenses ?? []).filter((item) => item.expense_date.startsWith(month)).reduce((sum, item) => sum + Number(item.amount), 0)
    }
  }
  const money = (amount: number | null) => amount == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const quickLinks = [
    ...(canSeeStudents ? [{ title: 'Students', detail: 'Open the student roster', href: `/dashboard/${orgId}/students`, icon: GraduationCap }] : []),
    ...(canManageSchool ? [{ title: 'Staff & Teachers', detail: 'Manage teaching staff', href: `/dashboard/${orgId}/staff`, icon: Users }] : []),
    ...(canManageSchool ? [{ title: 'Manage School', detail: 'Classes, sections and subjects', href: `/dashboard/${orgId}/school`, icon: School }] : []),
    ...(canSeeFinance ? [{ title: 'Fee Manager', detail: 'Record payments and view collections', href: `/dashboard/${orgId}/fees`, icon: Banknote }] : []),
    ...(canSeeExpenses ? [{ title: 'Expense Manager', detail: 'Record and review school expenses', href: `/dashboard/${orgId}/expenses`, icon: Receipt }] : []),
  ]

  return <div className="grid gap-6">
    <div><h1 className="text-3xl font-bold tracking-tight">Overview: {org.name}</h1><p className="mt-1 text-muted-foreground">Live totals for this franchise.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric title="Students" value={studentCount == null ? '—' : String(studentCount)} note="Enrolled in this franchise" icon={GraduationCap} />
      <Metric title="Active Teachers" value={String(activeTeachers)} note={pendingTeachers ? `${pendingTeachers} invitation${pendingTeachers === 1 ? '' : 's'} pending` : 'Teaching staff accounts'} icon={Users} />
      <Metric title="Classes" value={classCount == null ? '—' : String(classCount)} note="Configured classrooms" icon={Building2} />
      <Metric title="Sections" value={sectionCount == null ? '—' : String(sectionCount)} note="Across all classes" icon={BookOpen} />
    </div>
    {canSeeFinance && <Card><CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Collected revenue</CardTitle><CardDescription>Based on recorded fee payments for {org.name}.</CardDescription></div><Button asChild variant="outline"><Link href={`/dashboard/${orgId}/fees`}>Open Fee Manager</Link></Button></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">All time</p><p className="mt-1 text-2xl font-bold">{money(collectedTotal)}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">This month</p><p className="mt-1 text-2xl font-bold">{money(collectedMonth)}</p></div>{!paymentLedgerReady && <p className="text-sm text-amber-700 sm:col-span-2">Apply the school financial ledger section in schema_school_management.sql to enable payment totals.</p>}</CardContent></Card>}
    {canSeeExpenses && <Card><CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Expenses</CardTitle><CardDescription>Recorded expenses for {org.name}.</CardDescription></div><Button asChild variant="outline"><Link href={`/dashboard/${orgId}/expenses`}>Open Expense Manager</Link></Button></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">All time</p><p className="mt-1 text-2xl font-bold">{money(expenseTotal)}</p></div><div><p className="text-xs uppercase tracking-wide text-muted-foreground">This month</p><p className="mt-1 text-2xl font-bold">{money(expenseMonth)}</p></div>{!expenseLedgerReady && <p className="text-sm text-amber-700 sm:col-span-2">Apply the school financial ledger section in schema_school_management.sql to enable expense totals.</p>}</CardContent></Card>}
    <section className="space-y-3"><div><h2 className="text-lg font-semibold">Quick access</h2><p className="text-sm text-muted-foreground">Jump directly to the areas you manage.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{quickLinks.map(({ title, detail, href, icon: Icon }) => <Link key={title} href={href} className="group rounded-xl border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"><div className="flex items-center gap-3"><span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></span><div className="min-w-0"><p className="font-medium group-hover:text-primary">{title}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div></Link>)}</div></section>
  </div>
}
