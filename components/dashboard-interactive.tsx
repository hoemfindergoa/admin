'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { GraduationCap, Users, Building2, BookOpen, Banknote, Receipt, School, CalendarCheck, Clock, Flag, ChevronRight, MessageSquare, Bus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function MetricCard({ title, value, note, icon: Icon, colorClass, href }: any) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', ring: 'ring-indigo-200/50', hover: 'hover:border-indigo-300' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200/50', hover: 'hover:border-emerald-300' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-200/50', hover: 'hover:border-amber-300' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600', ring: 'ring-rose-200/50', hover: 'hover:border-rose-300' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-600', ring: 'ring-sky-200/50', hover: 'hover:border-sky-300' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200/50', hover: 'hover:border-purple-300' },
  } as const
  const theme = (colorMap as any)[colorClass] || colorMap.indigo

  const content = (
    <div className={cn("flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all h-full", href && `${theme?.hover} hover:shadow-md cursor-pointer group`)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1", theme?.bg, theme?.text, theme?.ring, href && "group-hover:scale-105 transition-transform")}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[12px] font-bold uppercase tracking-wider text-zinc-500">{title}</span>
        </div>
        {href && <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />}
      </div>
      <div>
        <div className="text-3xl font-black text-zinc-900 tracking-tight">{value}</div>
        {note && <p className="mt-1 text-[13px] font-medium text-zinc-500">{note}</p>}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}

export function DashboardInteractive({
  orgId, orgName, metrics, finance, events, attendanceStats, permissions, isOwner
}: any) {

  const isAdmin = isOwner || permissions.includes('FRANCHISE_ADMIN')
  const canSeeFinance = isAdmin || permissions.includes('fees')
  const canSeeExpenses = isAdmin || permissions.includes('expenses')
  const canSeeStudents = isAdmin || permissions.includes('students') || permissions.includes('manage_school')
  const canManageSchool = isAdmin || permissions.includes('manage_school')
  const canSeeAttendance = isAdmin || permissions.includes('attendance')
  const canSeeSchedules = isAdmin || permissions.includes('schedules')

  const money = (amount: number | null) => amount == null ? '—' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const quickLinks = [
    ...(canSeeStudents ? [{ title: 'Admission & Students', detail: 'Manage student records', href: `/dashboard/${orgId}/students`, icon: GraduationCap, color: 'sky' }] : []),
    ...(canManageSchool ? [{ title: 'Staff Directory', detail: 'Teaching staff', href: `/dashboard/${orgId}/staff`, icon: Users, color: 'emerald' }] : []),
    ...(canManageSchool ? [{ title: 'Academics', detail: 'Classes & subjects', href: `/dashboard/${orgId}/school`, icon: School, color: 'amber' }] : []),
    ...(canSeeFinance ? [{ title: 'Fee Management', detail: 'Collect & track fees', href: `/dashboard/${orgId}/fees`, icon: Banknote, color: 'emerald' }] : []),
    ...(canSeeAttendance ? [{ title: 'Attendance', detail: 'Daily registers', href: `/dashboard/${orgId}/attendance`, icon: CalendarCheck, color: 'indigo' }] : []),
    ...(canSeeSchedules ? [{ title: 'Timetables', detail: 'Class routines', href: `/dashboard/${orgId}/schedules`, icon: Clock, color: 'purple' }] : []),
  ]

  // Transform attendance data for recharts
  const chartData = useMemo(() => {
    return Object.keys(attendanceStats || {}).map(className => {
      const stats = attendanceStats[className]
      const total = stats.present + stats.absent + stats.late
      const percentage = total > 0 ? Math.round((stats.present / total) * 100) : 0
      return {
        name: className,
        Present: stats.present,
        Absent: stats.absent,
        Late: stats.late,
        Percentage: percentage
      }
    })
  }, [attendanceStats])

  return (
    <div className="grid gap-6 pb-10 w-full max-w-[1800px] mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-[14px] font-medium text-zinc-500">Live operational overview for {orgName}.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Students" value={metrics.studentCount} note="Enrolled in this franchise" icon={GraduationCap} colorClass="sky" href={canSeeStudents ? `/dashboard/${orgId}/students` : null} />
        <MetricCard title="Active Teachers" value={metrics.activeTeachers} note={metrics.pendingTeachers ? `${metrics.pendingTeachers} pending invites` : 'Teaching staff accounts'} icon={Users} colorClass="emerald" href={canManageSchool ? `/dashboard/${orgId}/staff` : null} />
        <MetricCard title="Classes" value={metrics.classCount} note="Configured classrooms" icon={Building2} colorClass="amber" href={canManageSchool ? `/dashboard/${orgId}/school` : null} />
        <MetricCard title="Revenue (MTD)" value={money(finance.collectedMonth)} note={finance.paymentLedgerReady ? "Total fees collected this month" : "Ledger not ready"} icon={Banknote} colorClass="indigo" href={canSeeFinance ? `/dashboard/${orgId}/fees` : null} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width) - Charts & Main Data */}
        <div className="lg:col-span-2 space-y-6">

          {/* Attendance Chart */}
          {canSeeAttendance && (
            <Card className="rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2"><CalendarCheck className="w-5 h-5 text-indigo-600" /> Today's Attendance</CardTitle>
                    <CardDescription>Class-wise attendance breakdown.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild className="h-8 font-bold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
                    <Link href={`/dashboard/${orgId}/attendance`}>View Register</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                        <Tooltip
                          cursor={{ fill: '#f4f4f5' }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="Present" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Late" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="Absent" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-zinc-400">
                    <CalendarCheck className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium text-sm">No attendance records found for today.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Links Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {quickLinks.map(({ title, detail, href, icon: Icon, color }) => {
              const bg = `bg-${color}-50`
              const text = `text-${color}-600`
              const ring = `ring-${color}-200`
              return (
                <Link key={title} href={href} className={cn("group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-[color]-300 hover:shadow-md hover:-translate-y-0.5", `hover:border-${color}-300`)}>
                  <div className="flex flex-col gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors", bg, text, ring)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn("font-bold text-[14px] text-zinc-900 transition-colors", `group-hover:${text}`)}>{title}</p>
                      <p className="text-[12px] font-medium text-zinc-500 line-clamp-1">{detail}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right Column (1/3 width) - Upcoming Events & Finance Summary */}
        <div className="space-y-6">

          {/* Upcoming Events Widget */}
          {canSeeSchedules && (
            <Card className="rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2"><Flag className="w-4 h-4 text-purple-600" /> Upcoming Events</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-bold text-zinc-500 hover:text-purple-700">
                    <Link href={`/dashboard/${orgId}/schedules`}>View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1">
                {events.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {events.map((ev: any) => {
                      const d = new Date(ev.start_date)
                      return (
                        <div key={ev.id} className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/dashboard/${orgId}/schedules`}>
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-zinc-100 text-zinc-800 flex-shrink-0">
                              <span className="text-[9px] font-bold uppercase">{d.toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-base font-black leading-none">{d.getDate()}</span>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-zinc-900">{ev.title}</h4>
                              <p className="text-xs text-zinc-500 font-medium mt-0.5 flex items-center gap-1">
                                <span className={cn("inline-block w-2 h-2 rounded-full", ev.event_type === 'HOLIDAY' ? 'bg-red-500' : 'bg-cyan-500')} />
                                {ev.event_type} {ev.is_full_day ? '• Full Day' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6 text-center">
                    <Flag className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No upcoming events scheduled.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mini Finance Overview */}
          {(canSeeFinance || canSeeExpenses) && (
            <Card className="rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                <CardTitle className="text-base flex items-center gap-2"><Banknote className="w-4 h-4 text-emerald-600" /> Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {canSeeFinance && (
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => window.location.href = `/dashboard/${orgId}/fees`}>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-0.5">MTD Income</p>
                        <p className="text-lg font-black text-emerald-700">{money(finance.collectedMonth)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                  {canSeeExpenses && (
                    <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl border border-rose-100 cursor-pointer hover:bg-rose-100 transition-colors" onClick={() => window.location.href = `/dashboard/${orgId}/expenses`}>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-0.5">MTD Expenses</p>
                        <p className="text-lg font-black text-rose-700">{money(finance.expenseMonth)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-rose-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
