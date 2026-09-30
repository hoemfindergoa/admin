import Link from 'next/link'
import { ArrowRight, BarChart3, Briefcase, Contact, Megaphone, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)

export function CrmReports({ data }: { data: any }) {
  const won = data.deals.filter((deal: any) => deal.stage === 'CLOSED_WON')
  const closed = data.deals.filter((deal: any) => ['CLOSED_WON', 'CLOSED_LOST'].includes(deal.stage))
  const winRate = closed.length ? Math.round(won.length / closed.length * 100) : 0
  const totalCampaignLeads = data.leads.filter((lead: any) => lead.campaign_id).length
  const stageRows = [['NEW', 'New'], ['CONTACTED', 'Contacted'], ['QUALIFIED', 'Qualified'], ['PROPOSAL', 'Proposal'], ['WON', 'Won'], ['LOST', 'Lost']].map(([key, label]) => ({ label, count: data.leads.filter((lead: any) => lead.status === key).length }))
  const sourceRows = Object.entries(data.leads.reduce((acc: Record<string, number>, lead: any) => { const source = lead.source || 'Unspecified'; acc[source] = (acc[source] || 0) + 1; return acc }, {})).map(([source, count]) => ({ source, count: Number(count) })).sort((a, b) => b.count - a.count)
  const maxLeadCount = Math.max(...stageRows.map((item) => item.count), 1)
  const maxSourceCount = Math.max(...sourceRows.map((item) => item.count), 1)
  const repRows = data.members.filter((member: any) => member.status === 'ACTIVE' && (data.access.isSuperAdmin || ['SALES_MANAGER', 'CRM_ADMIN'].includes(data.access.role) || member.user_id === data.access.userId)).map((member: any) => ({
    ...member,
    assigned: data.leads.filter((lead: any) => lead.owner_user_id === member.user_id).length,
    openDeals: data.deals.filter((deal: any) => deal.owner_user_id === member.user_id && !['CLOSED_WON', 'CLOSED_LOST'].includes(deal.stage)).length,
    wonValue: data.deals.filter((deal: any) => deal.owner_user_id === member.user_id && deal.stage === 'CLOSED_WON').reduce((sum: number, deal: any) => sum + Number(deal.value || 0), 0),
    activities: data.activities.filter((activity: any) => activity.owner_user_id === member.user_id && !activity.completed_at).length,
  })).sort((a: any, b: any) => b.wonValue - a.wonValue)

  return <div className="space-y-6 pb-16">
    <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-indigo-600">Performance insights</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Reports</h1><p className="mt-1 text-sm text-slate-500">Live pipeline, source attribution, and team activity from your CRM records.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      [Contact, 'Lead volume', data.leads.length, `${totalCampaignLeads} campaign-attributed`],
      [Briefcase, 'Open opportunity value', money(data.deals.filter((deal: any) => !['CLOSED_WON', 'CLOSED_LOST'].includes(deal.stage)).reduce((sum: number, deal: any) => sum + Number(deal.value || 0), 0)), `${data.deals.filter((deal: any) => !['CLOSED_WON', 'CLOSED_LOST'].includes(deal.stage)).length} active deals`],
      [TrendingUp, 'Closed-won value', money(won.reduce((sum: number, deal: any) => sum + Number(deal.value || 0), 0)), `${won.length} won deals`],
      [BarChart3, 'Win rate', `${winRate}%`, `${closed.length} deals closed`],
    ].map(([Icon, title, value, caption]: any) => <Card key={title} className="rounded-xl border-slate-200 shadow-sm"><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-400">{caption}</p></div><span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon className="h-5 w-5" /></span></CardContent></Card>)}</div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="rounded-xl border-slate-200 shadow-sm"><CardHeader><CardTitle className="text-base">Lead funnel</CardTitle><CardDescription>Prospect distribution by current stage</CardDescription></CardHeader><CardContent className="space-y-4">{stageRows.map((row) => <div key={row.label} className="grid grid-cols-[110px_1fr_35px] items-center gap-3"><span className="text-xs text-slate-500">{row.label}</span><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${row.count / maxLeadCount * 100}%` }} /></div><span className="text-right text-xs font-semibold">{row.count}</span></div>)}</CardContent></Card>
      <Card className="rounded-xl border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-4 w-4 text-indigo-600" />Lead sources</CardTitle><CardDescription>See where the sales pipeline starts</CardDescription></CardHeader><CardContent className="space-y-4">{sourceRows.length ? sourceRows.slice(0, 7).map((row) => <div key={row.source} className="grid grid-cols-[120px_1fr_35px] items-center gap-3"><span className="truncate text-xs text-slate-500">{row.source}</span><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${row.count / maxSourceCount * 100}%` }} /></div><span className="text-right text-xs font-semibold">{row.count}</span></div>) : <p className="py-8 text-center text-sm text-slate-500">Add leads to see source performance.</p>}</CardContent></Card>
    </div>
    <Card className="rounded-xl border-slate-200 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-indigo-600" />Team performance</CardTitle><CardDescription>Assigned leads, open work, and won revenue by teammate</CardDescription></CardHeader><CardContent>{repRows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="py-3">Teammate</th><th className="py-3">Assigned leads</th><th className="py-3">Open deals</th><th className="py-3">Open tasks</th><th className="py-3 text-right">Won revenue</th></tr></thead><tbody>{repRows.map((member: any) => <tr key={member.id} className="border-t"><td className="py-3"><p className="font-medium">{member.name}</p><p className="text-xs text-slate-500">{member.role.replaceAll('_', ' ').toLowerCase()}</p></td><td>{member.assigned}</td><td>{member.openDeals}</td><td>{member.activities}</td><td className="text-right font-medium">{money(member.wonValue)}</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-sm text-slate-500">Invite sales reps and assign records to compare team performance.</p>}</CardContent></Card>
    <div className="grid gap-4 sm:grid-cols-2"><Link href="/crm/deals" className="flex items-center justify-between rounded-xl border bg-white p-4 hover:border-indigo-200"><div><p className="font-medium">Deal pipeline</p><p className="mt-1 text-xs text-slate-500">Review opportunity stages and forecast values.</p></div><ArrowRight className="h-4 w-4 text-indigo-600" /></Link><Link href="/crm/campaigns" className="flex items-center justify-between rounded-xl border bg-white p-4 hover:border-indigo-200"><div><p className="font-medium">Campaign performance</p><p className="mt-1 text-xs text-slate-500">Compare campaign spend with leads generated.</p></div><ArrowRight className="h-4 w-4 text-indigo-600" /></Link></div>
  </div>
}
