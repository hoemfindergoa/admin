import Link from 'next/link'
import { ArrowRight, Briefcase, CalendarClock, CircleDollarSign, Contact, TrendingUp, Users, Building2 as Building2Icon, Megaphone as MegaphoneIcon, AlertCircle, CheckCircle2, Globe, Instagram, Facebook, Twitter, Mail, Linkedin, Smartphone } from 'lucide-react'

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)

const dateLabel = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'

const stageColors: Record<string, string> = {
  QUALIFICATION: 'bg-blue-500',
  NEEDS_ANALYSIS: 'bg-purple-500',
  PROPOSAL: 'bg-amber-500',
  NEGOTIATION: 'bg-orange-500',
  CLOSED_WON: 'bg-emerald-500',
  CLOSED_LOST: 'bg-rose-500',
}

function SourceIcon({ source }: { source?: string }) {
  if (!source) return <Globe className="h-3 w-3 text-zinc-400" />
  const s = source.toLowerCase()
  if (s.includes('instagram') || s.includes('ig')) return <Instagram className="h-3 w-3 text-pink-600" />
  if (s.includes('facebook') || s.includes('fb')) return <Facebook className="h-3 w-3 text-blue-600" />
  if (s.includes('twitter') || s.includes('x')) return <Twitter className="h-3 w-3 text-sky-500" />
  if (s.includes('linkedin')) return <Linkedin className="h-3 w-3 text-blue-700" />
  if (s.includes('email') || s.includes('mail')) return <Mail className="h-3 w-3 text-amber-500" />
  if (s.includes('phone') || s.includes('call')) return <Smartphone className="h-3 w-3 text-emerald-600" />
  return <Globe className="h-3 w-3 text-blue-500" />
}

export function CrmHome({ data }: { data: any }) {
  const { leads, deals, activities, contacts, accounts, campaigns, members } = data
  const openDeals = deals.filter((d: any) => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage))
  const wonValue = deals.filter((d: any) => d.stage === 'CLOSED_WON').reduce((s: number, d: any) => s + Number(d.value || 0), 0)
  const pipeline = openDeals.reduce((s: number, d: any) => s + Number(d.value || 0), 0)
  const weighted = openDeals.reduce((s: number, d: any) => s + Number(d.value || 0) * Number(d.probability || 0) / 100, 0)
  const overdue = activities.filter((a: any) => !a.completed_at && a.due_at && new Date(a.due_at) < new Date())
  const upcoming = activities.filter((a: any) => !a.completed_at && a.due_at && new Date(a.due_at) >= new Date()).slice(0, 5)

  const stages = [
    ['QUALIFICATION', 'Qualification'],
    ['NEEDS_ANALYSIS', 'Needs Analysis'],
    ['PROPOSAL', 'Proposal'],
    ['NEGOTIATION', 'Negotiation'],
    ['CLOSED_WON', 'Won'],
    ['CLOSED_LOST', 'Lost'],
  ]
  const stageCounts = stages.map(([stage, label]) => ({
    stage, label,
    count: deals.filter((d: any) => d.stage === stage).length,
    amount: deals.filter((d: any) => d.stage === stage).reduce((s: number, d: any) => s + Number(d.value || 0), 0),
  }))
  const maxAmount = Math.max(...stageCounts.map(s => s.amount), 1)

  const glance = [
    [Contact, 'Contacts', contacts.length, 'contacts'],
    [Building2Icon, 'Accounts', accounts.length, 'accounts'],
    [MegaphoneIcon, 'Campaigns', campaigns.length, 'campaigns'],
  ] as const
  const workspaceId = data.access.workspaceId
  const base = `/crm/${workspaceId}`

  return (
    <div className="space-y-8 pb-16">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Growth Workspace</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Overview</h1>
        </div>
        <Link
          href={`${base}/leads?new=1`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-5 text-[14px] font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
        >
          + Add prospect
        </Link>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Open Pipeline', value: money(pipeline), sub: `${openDeals.length} active opportunities`, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Weighted Forecast', value: money(weighted), sub: 'By deal probability', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Won Revenue', value: money(wonValue), sub: `${deals.filter((d: any) => d.stage === 'CLOSED_WON').length} deals closed`, icon: CircleDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Prospects', value: leads.filter((l: any) => !['CONVERTED', 'WON', 'LOST'].includes(l.status)).length, sub: `${leads.length} total leads`, icon: Contact, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(metric => (
          <div key={metric.label} className="group rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-zinc-500">{metric.label}</p>
                <p className="mt-2.5 text-3xl font-bold tracking-tight text-zinc-900">{metric.value}</p>
                <p className="mt-1.5 text-[12px] font-medium text-zinc-400">{metric.sub}</p>
              </div>
              <span className={`rounded-xl p-2.5 ${metric.bg}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline + Activities */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Deal pipeline */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
            <div>
              <p className="text-[15px] font-bold text-zinc-900">Deal Pipeline</p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Open value and opportunities by stage</p>
            </div>
            <Link href={`${base}/deals`} className="flex items-center gap-1.5 text-[13px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex-1 px-6 py-5 space-y-4">
            {stageCounts.map((s, i) => (
              <div key={s.stage} className="grid grid-cols-[140px_1fr_90px] items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${s.stage ? stageColors[s.stage] : 'bg-zinc-300'}`} />
                  <span className="truncate text-[13px] font-medium text-zinc-600">{s.label}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${s.stage ? stageColors[s.stage] : 'bg-zinc-300'}`}
                    style={{ width: `${Math.max(s.amount ? 5 : 0, s.amount / maxAmount * 100)}%` }}
                  />
                </div>
                <span className="text-right text-[13px] font-bold text-zinc-700">{money(s.amount)}</span>
              </div>
            ))}
            {deals.length === 0 && (
              <p className="py-8 text-center text-[13px] text-zinc-400">No deals yet. Convert a lead to get started.</p>
            )}
          </div>
        </div>

        {/* Next actions */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
            <div>
              <p className="text-[15px] font-bold text-zinc-900">
                {data.access.isSuperAdmin || ['SALES_MANAGER', 'CRM_ADMIN'].includes(data.access.role) ? 'Team Follow-ups' : 'My Next Actions'}
              </p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Keep deals moving forward</p>
            </div>
            <Link href={`${base}/activities`} className="flex items-center gap-1.5 text-[13px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex-1 px-6 py-4">
            {overdue.length > 0 && (
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700 shadow-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {overdue.length} overdue follow-up{overdue.length !== 1 ? 's' : ''} requiring attention
              </div>
            )}
            {upcoming.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-center text-[13px] text-zinc-500">
                <CalendarClock className="mb-2 h-6 w-6 text-zinc-400" />
                No upcoming actions.<br />Add a task or meeting to keep momentum.
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-zinc-100">
                {upcoming.map((item: any) => (
                  <div key={item.id} className="group flex items-center gap-3.5 py-3.5 hover:bg-zinc-50/50 rounded-lg px-2 -mx-2 transition-colors">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 shadow-sm">
                      <CalendarClock className="h-4 w-4 text-indigo-600" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-zinc-800">{item.subject}</p>
                      <p className="text-[12px] font-medium text-zinc-500 mt-0.5 flex items-center gap-1.5">
                        <span className="capitalize">{item.kind.toLowerCase()}</span>
                        <span>•</span>
                        <span className="text-zinc-400">{dateLabel(item.due_at)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leads + Glance */}
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        {/* Recent leads */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
            <div>
              <p className="text-[15px] font-bold text-zinc-900">Recently Updated Leads</p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Pick up where the team left off</p>
            </div>
            <Link href={`${base}/leads`} className="flex items-center gap-1.5 text-[13px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex-1 divide-y divide-zinc-100">
            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                <Contact className="mb-3 h-8 w-8 text-zinc-300" />
                <p className="text-[13px] font-medium">Your first prospect is one quick add away.</p>
              </div>
            ) : (
              leads.slice(0, 6).map((lead: any) => (
                <div key={lead.id} className="group flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-[13px] font-bold text-zinc-700 shadow-sm">
                    {lead.company_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-zinc-900">{lead.company_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[12px] text-zinc-500 font-medium">
                      <span className="truncate">{lead.contact_name}</span>
                      {lead.email && (
                        <>
                          <span>•</span>
                          <span className="truncate text-zinc-400">{lead.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={
                      `rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${lead.status === 'NEW' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20' :
                        lead.status === 'CONTACTED' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' :
                          lead.status === 'QUALIFIED' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' :
                            'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-500/20'
                      }`
                    }>
                      {lead.status.toLowerCase().replaceAll('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400" title={`Source: ${lead.source || 'Unknown'}`}>
                      <SourceIcon source={lead.source} />
                      {lead.source || 'Website'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* At a glance */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5">
            <p className="text-[15px] font-bold text-zinc-900">Workspace at a Glance</p>
            <p className="text-[13px] text-zinc-500 mt-0.5">People and records</p>
          </div>
          <div className="flex-1 p-3">
            {data.access.isSuperAdmin && (
              <Link href={`${base}/team`} className="group flex items-center gap-4 rounded-xl px-4 py-3.5 hover:bg-zinc-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Users className="h-4 w-4" />
                </div>
                <span className="flex-1 text-[14px] font-medium text-zinc-600 group-hover:text-zinc-900">Team members</span>
                <span className="text-[14px] font-bold text-zinc-900">{members.length}</span>
              </Link>
            )}
            {glance.map(([Icon, label, count, slug]) => (
              <Link key={label} href={`${base}/${slug}`} className="group flex items-center gap-4 rounded-xl px-4 py-3.5 hover:bg-zinc-50 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-[14px] font-medium text-zinc-600 group-hover:text-zinc-900">{label}</span>
                <span className="text-[14px] font-bold text-zinc-900">{count}</span>
              </Link>
            ))}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-[12px] font-medium text-emerald-800">Workspace data is fully isolated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
