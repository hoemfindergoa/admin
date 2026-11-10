import Link from 'next/link'
import {
  AlertCircle, ArrowRight, Building2, CheckCircle2, Contact, Facebook,
  Globe, Instagram, Mail, Megaphone, MessageSquareText, Smartphone,
  Target, Twitter, Users,
} from 'lucide-react'
import { CrmRemindersPanel } from '@/components/crm-reminders-panel'

const terminalLeadStatuses = new Set(['WON', 'CONVERTED', 'LOST', 'DELETED'])
const successfulLeadStatuses = new Set(['WON', 'CONVERTED'])

const statusTone: Record<string, { label: string; color: string; badge: string }> = {
  NEW: { label: 'New', color: 'bg-info', badge: 'badge-info' },
  CONTACTED: { label: 'Contacted', color: 'bg-warning', badge: 'badge-warning' },
  QUALIFIED: { label: 'Qualified', color: 'bg-success', badge: 'badge-success' },
  PROPOSAL: { label: 'Proposal', color: 'bg-secondary', badge: 'badge-secondary' },
  NEGOTIATION: { label: 'Negotiation', color: 'bg-warning', badge: 'badge-warning' },
  WON: { label: 'Won', color: 'bg-success', badge: 'badge-success' },
  CONVERTED: { label: 'Converted', color: 'bg-success', badge: 'badge-success' },
  LOST: { label: 'Lost', color: 'bg-error', badge: 'badge-error' },
}

function SourceIcon({ source }: { source?: string }) {
  if (!source) return <Globe className="h-3.5 w-3.5 text-base-content/45" />
  const value = source.toLowerCase()
  if (value.includes('instagram') || value.includes('ig')) return <Instagram className="h-3.5 w-3.5 text-pink-600" />
  if (value.includes('facebook') || value.includes('fb')) return <Facebook className="h-3.5 w-3.5 text-blue-600" />
  if (value.includes('twitter') || value === 'x') return <Twitter className="h-3.5 w-3.5 text-sky-600" />
  if (value.includes('linkedin')) return <Contact className="h-3.5 w-3.5 text-blue-700" />
  if (value.includes('email') || value.includes('mail')) return <Mail className="h-3.5 w-3.5 text-amber-600" />
  if (value.includes('phone') || value.includes('call')) return <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
  return <Globe className="h-3.5 w-3.5 text-base-content/45" />
}

function shortDate(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function CrmHome({ data }: { data: any }) {
  const { leads, activities, contacts, accounts, campaigns, members, notes } = data
  const isManager = data.access.isSuperAdmin || ['SALES_MANAGER', 'CRM_ADMIN'].includes(data.access.role)
  const visibleLeads = leads.filter((lead: any) => lead.status !== 'DELETED')
  const openActivities = activities.filter((activity: any) => !activity.completed_at)
  const overdue = openActivities.filter((activity: any) => {
    const dueAt = activity.reminder_at ?? activity.due_at
    return dueAt && new Date(dueAt) < new Date()
  })
  const openActions = [...openActivities]
    .sort((a: any, b: any) => {
      const reminderPriority = Number(!!b.reminder_at) - Number(!!a.reminder_at)
      if (reminderPriority) return reminderPriority
      const aDue = a.reminder_at ?? a.due_at
      const bDue = b.reminder_at ?? b.due_at
      if (!aDue) return 1
      if (!bDue) return -1
      return new Date(aDue).getTime() - new Date(bDue).getTime()
    })
    .slice(0, 5)

  const leadCount = visibleLeads.length
  const assignedCount = visibleLeads.filter((lead: any) => !!lead.owner_user_id).length
  const unassignedCount = visibleLeads.filter((lead: any) => !lead.owner_user_id).length
  const newLeadCount = visibleLeads.filter((lead: any) => lead.status === 'NEW').length
  const successfulCount = visibleLeads.filter((lead: any) => successfulLeadStatuses.has(lead.status)).length
  const activeLeadCount = visibleLeads.filter((lead: any) => !terminalLeadStatuses.has(lead.status)).length
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueLeadCount = visibleLeads.filter((lead: any) => lead.next_follow_up && new Date(`${lead.next_follow_up}T00:00:00`) <= today && !terminalLeadStatuses.has(lead.status)).length
  const activeMembers = members.filter((member: any) => member.status === 'ACTIVE')

  const metricCards = isManager
    ? [
        { label: 'Total leads', value: leadCount, detail: `${activeLeadCount} active in the pipeline`, icon: Contact, tone: 'bg-primary/10 text-primary' },
        { label: 'Assigned', value: assignedCount, detail: `Across ${activeMembers.length} active teammates`, icon: Users, tone: 'bg-info/10 text-info' },
        { label: 'Needs assignment', value: unassignedCount, detail: 'Waiting in the admin queue', icon: Target, tone: 'bg-warning/15 text-warning' },
        { label: 'Successful leads', value: successfulCount, detail: 'Won or converted', icon: CheckCircle2, tone: 'bg-success/10 text-success' },
      ]
    : [
        { label: 'My assigned leads', value: leadCount, detail: `${activeLeadCount} active leads to work`, icon: Contact, tone: 'bg-primary/10 text-primary' },
        { label: 'New leads', value: newLeadCount, detail: 'Waiting for first contact', icon: Target, tone: 'bg-info/10 text-info' },
        { label: 'Follow-ups due', value: dueLeadCount, detail: 'Today or overdue', icon: AlertCircle, tone: 'bg-warning/15 text-warning' },
        { label: 'Successful leads', value: successfulCount, detail: 'Won or converted', icon: CheckCircle2, tone: 'bg-success/10 text-success' },
      ]

  const statusOrder: (keyof typeof statusTone)[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'CONVERTED', 'LOST']
  const statusCounts = statusOrder.map((status) => ({
    status,
    count: visibleLeads.filter((lead: any) => lead.status === status).length,
    ...statusTone[status],
  }))
  const maxStatusCount = Math.max(...statusCounts.map((status) => status.count), 1)

  const latestNoteByLead = new Map<string, any>()
  for (const note of notes ?? []) {
    if (note.parent_type === 'LEAD' && !latestNoteByLead.has(note.parent_id)) latestNoteByLead.set(note.parent_id, note)
  }
  const memberNameByUserId = new Map<string, string>(members.map((member: any) => [member.user_id, member.name || member.email || 'Team member']))

  const glance = [
    { label: 'Contacts', count: contacts.length, href: 'contacts', icon: Contact },
    { label: 'Accounts', count: accounts.length, href: 'accounts', icon: Building2 },
    { label: 'Campaigns', count: campaigns.length, href: 'campaigns', icon: Megaphone },
  ]
  const workspaceId = data.access.workspaceId
  const base = `/crm/${workspaceId}`

  return (
    <div className="space-y-6 pb-12">
      <section className="card card-border flex flex-col gap-4 rounded-2xl bg-base-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Sales CRM</p>
          <h1 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[28px]">Overview</h1>
          <p className="mt-1 text-sm text-base-content/60">{isManager ? 'Workspace lead volume, assignment queue, and team follow-ups.' : 'Your assigned leads, follow-ups, and latest team updates.'}</p>
          <p className="mt-2 text-xs text-base-content/50">
            {isManager
              ? `${leadCount} total · ${assignedCount} assigned · ${unassignedCount} need assignment`
              : `${leadCount} assigned to you · ${successfulCount} successfully closed`}
          </p>
        </div>
        <Link href={`${base}/leads?new=1`} className="btn btn-primary min-h-11 gap-2"><Contact className="h-4 w-4" />Add lead</Link>
      </section>

      <section aria-label="Lead summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, detail, icon: Icon, tone }) => <article key={label} className="card card-border rounded-xl bg-base-100 transition-colors hover:border-primary/30">
          <div className="card-body gap-3 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-base-content/65">{label}</h2><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span></div>
            <div><p className="text-3xl font-semibold tracking-tight text-base-content">{value}</p><p className="mt-1 text-xs text-base-content/55">{detail}</p></div>
          </div>
        </article>)}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <article className="card card-border overflow-hidden bg-base-100">
          <header className="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-4 sm:px-6">
            <div><h2 className="text-sm font-semibold">Lead status overview</h2><p className="mt-1 text-xs text-base-content/55">{isManager ? 'Current status across the workspace' : 'Status of your assigned leads'}</p></div>
            <Link href={`${base}/leads`} className="btn btn-ghost btn-sm gap-1">View leads <ArrowRight className="h-4 w-4" /></Link>
          </header>
          <div className="space-y-4 px-5 py-5 sm:px-6">
            {statusCounts.map((status) => <div key={status.status}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-medium text-base-content/70">{status.label}</span><span className="font-semibold text-base-content">{status.count}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-base-200"><div className={`h-full rounded-full ${status.color}`} style={{ width: `${(status.count / maxStatusCount) * 100}%` }} /></div>
            </div>)}
            {leadCount === 0 && <p className="py-6 text-center text-sm text-base-content/55">No leads in this view yet.</p>}
          </div>
        </article>

        <article className="card card-border flex flex-col overflow-hidden bg-base-100">
          <header className="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-4 sm:px-6">
            <div><h2 className="text-sm font-semibold">{isManager ? 'Team follow-ups' : 'My next actions'}</h2><p className="mt-1 text-xs text-base-content/55">Reminders assigned to the teammate responsible</p></div>
            <Link href={`${base}/activities`} className="btn btn-ghost btn-sm gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
          </header>
          <div className="flex-1 space-y-3 p-4 sm:p-5">
            {overdue.length > 0 && <div role="status" className="flex items-center gap-2.5 rounded-lg border border-error/20 bg-error/5 px-3.5 py-3 text-xs font-medium text-error"><AlertCircle className="h-4 w-4 shrink-0" />{overdue.length} overdue follow-up{overdue.length !== 1 ? 's' : ''} need attention</div>}
            <CrmRemindersPanel workspaceId={workspaceId} activities={openActions} leadNames={Object.fromEntries(leads.map((lead: any) => [lead.id, lead.company_name]))} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <article className="card card-border flex flex-col overflow-hidden bg-base-100">
          <header className="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-4 sm:px-6">
            <div><h2 className="text-sm font-semibold">Recently updated leads</h2><p className="mt-1 text-xs text-base-content/55">Latest lead changes and remarks {isManager ? 'from across the workspace' : 'on your assigned leads'}</p></div>
            <Link href={`${base}/leads`} className="btn btn-ghost btn-sm gap-1">View all <ArrowRight className="h-4 w-4" /></Link>
          </header>
          <div className="flex-1 divide-y divide-base-200">
            {visibleLeads.length === 0 ? <div className="flex flex-col items-center justify-center px-5 py-12 text-center text-base-content/55">
              <Contact className="mb-3 h-7 w-7 text-base-content/25" /><p className="text-sm font-medium">No leads in this view yet.</p><p className="mt-1 text-xs">New leads will appear here when they are added or assigned.</p>
            </div> : visibleLeads.slice(0, 6).map((lead: any) => {
              const note = latestNoteByLead.get(lead.id)
              const remark = note?.body || lead.notes
              const noteAuthor = note?.created_by_email?.split('@')[0] || memberNameByUserId.get(note?.created_by) || lead.updated_by_email?.split('@')[0] || memberNameByUserId.get(lead.updated_by)
              const updatedBy = memberNameByUserId.get(lead.updated_by) || lead.updated_by_email?.split('@')[0]
              return <article key={lead.id} className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-base-200/40 sm:px-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-base-300 bg-base-200 text-sm font-semibold text-base-content/75">{lead.company_name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className="truncate text-sm font-semibold text-base-content">{lead.company_name}</h3>
                    <span className={`badge badge-soft border-0 text-[10px] font-semibold uppercase ${statusTone[lead.status]?.badge ?? 'badge-neutral'}`}>{statusTone[lead.status]?.label ?? lead.status.toLowerCase().replaceAll('_', ' ')}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/55">
                    <span>{lead.contact_name}</span><span aria-hidden="true">·</span><span className="inline-flex items-center gap-1"><SourceIcon source={lead.source} />{lead.source || 'Website'}</span>
                    {lead.updated_at && <><span aria-hidden="true">·</span><span>Updated {shortDate(lead.updated_at)}{updatedBy ? ` by ${updatedBy}` : ''}</span></>}
                  </div>
                  {remark && <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-base-200/60 px-3 py-2">
                    <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <div className="min-w-0"><p className="line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-base-content/80">{remark}</p><p className="mt-0.5 text-[10px] text-base-content/50">Remark{noteAuthor ? ` by ${noteAuthor}` : ''}{(note?.created_at || lead.updated_at) ? ` · ${shortDate(note?.created_at || lead.updated_at)}` : ''}</p></div>
                  </div>}
                </div>
              </article>
            })}
          </div>
        </article>

        <article className="card card-border flex flex-col overflow-hidden bg-base-100">
          <header className="border-b border-base-300 px-5 py-4 sm:px-6"><h2 className="text-sm font-semibold">Workspace at a glance</h2><p className="mt-1 text-xs text-base-content/55">People and supporting records</p></header>
          <div className="flex-1 p-3">
            {isManager && <Link href={`${base}/team`} className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-base-200/60">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-base-200 text-base-content/60 group-hover:bg-primary/10 group-hover:text-primary"><Users className="h-4 w-4" /></span><span className="flex-1 text-sm font-medium">Active teammates</span><span className="text-sm font-bold">{activeMembers.length}</span>
            </Link>}
            {glance.map(({ label, count, href, icon: Icon }) => <Link key={label} href={`${base}/${href}`} className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-base-200/60">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-base-200 text-base-content/60 group-hover:bg-primary/10 group-hover:text-primary"><Icon className="h-4 w-4" /></span><span className="flex-1 text-sm font-medium">{label}</span><span className="text-sm font-bold">{count}</span>
            </Link>)}
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-3 py-3 text-xs font-medium text-success"><CheckCircle2 className="h-4 w-4 shrink-0" />Workspace data is isolated by team access</div>
          </div>
        </article>
      </section>
    </div>
  )
}
