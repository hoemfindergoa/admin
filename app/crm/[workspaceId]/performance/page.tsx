import Link from 'next/link'
import { ArrowLeft, CheckCircle2, TrendingUp, UserRound, UsersRound } from 'lucide-react'
import { getCrmPerformanceData } from './actions'

export default async function CrmPerformancePage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params
  const data = await getCrmPerformanceData(workspaceId)
  const base = `/crm/${workspaceId}`

  const metrics = [
    { label: 'Assigned right now', value: data.totalAssigned, detail: 'Leads currently owned by the team', icon: UsersRound },
    { label: 'Assigned this week', value: data.assignedThisWeek, detail: 'Unique leads assigned in the last 7 days', icon: UserRound },
    { label: 'Closed successfully', value: data.closedThisWeek, detail: 'Won or converted in the last 7 days', icon: CheckCircle2 },
    { label: 'Successful leads', value: data.successfulNow, detail: 'Currently won or converted', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href={`${base}/leads`} className="link link-hover mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-base-content/60"><ArrowLeft className="h-3.5 w-3.5" />Leads</Link>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Admin workspace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-base-content">Team performance</h1>
          <p className="mt-1 text-sm text-base-content/60">Lead ownership and successful outcomes over the last seven days.</p>
        </div>
        <span className="badge badge-outline badge-lg self-start sm:self-auto">Rolling 7 days</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => <article key={label} className="card card-border bg-base-100">
          <div className="card-body gap-4 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-base-content/65">{label}</h2><span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span></div>
            <div><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-base-content/55">{detail}</p></div>
          </div>
        </article>)}
      </div>

      <section className="card card-border overflow-hidden bg-base-100">
        <div className="flex flex-col gap-1 border-b border-base-300 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><h2 className="font-semibold">Performance by teammate</h2><p className="mt-1 text-xs text-base-content/55">Weekly activity is counted from assignment and close events recorded after CRM tracking was enabled.</p></div>
          <span className="text-xs text-base-content/50">{data.rows.length} active members</span>
        </div>
        {data.rows.length ? <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead><tr><th>Teammate</th><th>Assigned now</th><th>Assigned · 7 days</th><th>Successful leads</th><th>Closed · 7 days</th></tr></thead>
            <tbody>{data.rows.map((member: any) => <tr key={member.userId}>
              <td><div className="font-semibold">{member.name}</div><div className="mt-0.5 text-xs capitalize text-base-content/55">{member.role.toLowerCase().replaceAll('_', ' ')}{member.email ? ` · ${member.email}` : ''}</div></td>
              <td><span className="badge badge-ghost">{member.assignedNow}</span></td>
              <td><span className="badge badge-primary badge-soft">{member.assignedThisWeek}</span></td>
              <td><span className="badge badge-success badge-soft">{member.successfulNow}</span></td>
              <td><span className="badge badge-success">{member.closedThisWeek}</span></td>
            </tr>)}</tbody>
          </table>
        </div> : <div className="px-5 py-12 text-center text-sm text-base-content/55">No active team members found in this workspace.</div>}
      </section>
    </div>
  )
}
