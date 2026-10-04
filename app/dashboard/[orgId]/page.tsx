import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { DashboardInteractive } from '@/components/dashboard-interactive'

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
  const permissions = Array.isArray(member?.permissions) ? member?.permissions as string[] : []

  const admin = createAdminClient()
  
  // 1. Fetch Core Metrics
  const [{ count: studentCount }, { data: teachers }, { count: classCount }] = await Promise.all([
    admin.from('students').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
    admin.from('school_teachers').select('status').eq('org_id', orgId),
    admin.from('school_classes').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
  ])
  const activeTeachers = teachers?.filter((t) => t.status === 'ACTIVE').length ?? 0
  const pendingTeachers = teachers?.filter((t) => t.status === 'PENDING').length ?? 0

  // 2. Fetch Finance Data
  const current = new Date()
  const currentMonthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
  
  const [{ data: payments, error: payErr }, { data: expenses, error: expErr }] = await Promise.all([
    admin.from('school_fee_payments').select('amount, payment_date').eq('org_id', orgId).gte('payment_date', `${currentMonthStr}-01`),
    admin.from('school_expenses').select('amount, expense_date').eq('org_id', orgId).gte('expense_date', `${currentMonthStr}-01`)
  ])
  
  const collectedMonth = payErr ? null : (payments ?? []).reduce((sum, item) => sum + Number(item.amount), 0)
  const expenseMonth = expErr ? null : (expenses ?? []).reduce((sum, item) => sum + Number(item.amount), 0)

  // 3. Fetch Upcoming Events
  const todayStr = current.toISOString()
  const { data: upcomingEvents } = await admin.from('school_events')
    .select('*')
    .eq('org_id', orgId)
    .gte('start_date', todayStr)
    .order('start_date', { ascending: true })
    .limit(5)

  // 4. Fetch Today's Attendance Stats
  const todayDateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
  
  // Get all attendance for today
  const { data: attendance } = await admin.from('school_attendance')
    .select('student_id, status')
    .eq('org_id', orgId)
    .eq('date', todayDateStr)

  // Get classes and students to map it
  const [{ data: allClasses }, { data: allStudents }] = await Promise.all([
    admin.from('school_classes').select('id, name').eq('org_id', orgId),
    admin.from('students').select('id, class_id').eq('org_id', orgId)
  ])

  // Aggregate
  const attendanceStats: Record<string, { present: number, absent: number, late: number }> = {}
  
  if (allClasses && allStudents && attendance) {
    // Initialize stats for each class
    allClasses.forEach(c => {
      attendanceStats[c.name] = { present: 0, absent: 0, late: 0 }
    })
    
    // Create lookup maps
    const studentClassMap = new Map(allStudents.map(s => [s.id, s.class_id]))
    const classNameMap = new Map(allClasses.map(c => [c.id, c.name]))
    
    // Process records
    attendance.forEach(record => {
      const classId = studentClassMap.get(record.student_id)
      if (classId) {
        const className = classNameMap.get(classId)
        const stats = className ? attendanceStats[className] : undefined;
        if (stats) {
          if (record.status === 'PRESENT') stats.present++
          if (record.status === 'ABSENT') stats.absent++
          if (record.status === 'LATE') stats.late++
        }
      }
    })
  }

  return (
    <DashboardInteractive 
      orgId={orgId}
      orgName={org.name}
      permissions={permissions}
      isOwner={isOwner}
      metrics={{ studentCount, activeTeachers, pendingTeachers, classCount }}
      finance={{ collectedMonth, expenseMonth, paymentLedgerReady: !payErr }}
      events={upcomingEvents ?? []}
      attendanceStats={attendanceStats}
    />
  )
}
