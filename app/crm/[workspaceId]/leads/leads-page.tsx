'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addLead, updateLeadStatus, deleteLead, addLeadRemark, assignLead, createLeadReminder } from './actions'
import {
  Globe, Instagram, Facebook, Mail, Smartphone, Linkedin, Twitter,
  Plus, Trash2, ChevronDown, MessageSquare, Clock, CheckCircle2,
  X, History, User, Send,
  TrendingUp, CalendarClock, UsersRound, Target, BellPlus, Search, ArrowUpRight
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const SOURCES = ['Website', 'Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'Email', 'Phone', 'Referral', 'Walk-in', 'Other']
const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']

const statusColors: Record<string, string> = {
  NEW: 'badge-info',
  CONTACTED: 'badge-warning',
  QUALIFIED: 'badge-success',
  PROPOSAL: 'badge-secondary',
  NEGOTIATION: 'badge-warning',
  WON: 'badge-success',
  LOST: 'badge-error',
}

const PRESET_REMARKS = [
  { text: 'Follow-up taken - discussed details', label: 'Follow-up taken', color: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { text: 'Call not picked / Unreachable', label: 'Call not picked', color: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { text: 'No response to call/message', label: 'No response', color: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100' },
  { text: 'Busy - requested call back later', label: 'Call later', color: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100' },
  { text: 'WhatsApp message sent with details', label: 'WhatsApp sent', color: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  { text: 'Interested - demo / meeting requested', label: 'Interested / demo', color: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100' },
  { text: 'Not interested / Not relevant now', label: 'Not interested', color: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' },
]

function formatTimeAgo(dateStr?: string | null) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  if (diff < 0) return 'Just now'
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function SourceIcon({ source }: { source?: string }) {
  const s = (source ?? '').toLowerCase()
  if (s.includes('instagram')) return <Instagram className="h-3.5 w-3.5 text-pink-500" />
  if (s.includes('facebook')) return <Facebook className="h-3.5 w-3.5 text-blue-600" />
  if (s.includes('linkedin')) return <Linkedin className="h-3.5 w-3.5 text-blue-700" />
  if (s.includes('twitter')) return <Twitter className="h-3.5 w-3.5 text-sky-500" />
  if (s.includes('email')) return <Mail className="h-3.5 w-3.5 text-amber-500" />
  if (s.includes('phone')) return <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
  return <Globe className="h-3.5 w-3.5 text-blue-500" />
}

export function LeadsPage({
  workspaceId,
  leads,
  campaigns,
  notes = [],
  members = [],
  access,
}: {
  workspaceId: string
  leads: any[]
  campaigns: any[]
  notes?: any[]
  members?: any[]
  access: any
}) {
  const router = useRouter()
  const canAssignLeads = access.isSuperAdmin || ['SALES_MANAGER', 'CRM_ADMIN'].includes(access.role)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [showDeleted, setShowDeleted] = useState(false)

  // Remarks Modal State
  const [activeRemarkLead, setActiveRemarkLead] = useState<any | null>(null)
  const [customRemark, setCustomRemark] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [remarkLoading, setRemarkLoading] = useState(false)
  const [reminderLoading, setReminderLoading] = useState(false)
  const [reminderError, setReminderError] = useState('')

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const formData = new FormData(e.currentTarget)

    const company = String(formData.get('company_name') ?? '').trim()
    const contact = String(formData.get('contact_name') ?? '').trim()
    if (!company || !contact) {
      setError('Company name and contact name are required.')
      return
    }

    startTransition(async () => {
      try {
        await addLead(workspaceId, formData)
        toast.success('Lead created successfully.')
        setSuccess('Lead added successfully!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to add lead.')
        setError(err.message ?? 'Failed to add lead.')
      }
    })
  }

  function handleStatusChange(leadId: string, status: string) {
    startTransition(async () => {
      try {
        await updateLeadStatus(workspaceId, leadId, status)
        toast.success('Lead status updated.')
        router.refresh()
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to update lead status.')
        setError(err.message ?? 'Failed to update status.')
      }
    })
  }

  function handleAssignChange(leadId: string, ownerUserId: string) {
    startTransition(async () => {
      try {
        await assignLead(workspaceId, leadId, ownerUserId)
        toast.success('Lead assigned successfully.')
        router.refresh()
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to assign lead.')
        setError(err.message ?? 'Failed to assign lead.')
      }
    })
  }

  function handleDelete(leadId: string) {
    if (!confirm('Archive this lead? You can still view it from the archive filter.')) return
    startTransition(async () => {
      try {
        await deleteLead(workspaceId, leadId)
        toast.success('Lead archived successfully.')
        router.refresh()
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to archive lead.')
        setError(err.message ?? 'Failed to delete lead.')
      }
    })
  }

  async function handleSaveRemark(remarkTextToSave?: string) {
    if (!activeRemarkLead) return
    const text = (remarkTextToSave || customRemark).trim()
    const statusChanged = !!newStatus && newStatus !== activeRemarkLead.status
    if (!text && !statusChanged) return

    setRemarkLoading(true)
    setError('')
    try {
      if (text) await addLeadRemark(workspaceId, activeRemarkLead.id, text)
      if (statusChanged) {
        await updateLeadStatus(workspaceId, activeRemarkLead.id, newStatus)
      }
      setSuccess(text && statusChanged ? 'Note saved and lead status updated.' : text ? 'Note saved.' : 'Lead status updated.')
      toast.success(text && statusChanged ? 'Note saved and lead status updated.' : text ? 'Note saved.' : 'Lead status updated.')
      setCustomRemark('')
      setActiveRemarkLead(null)
      setNewStatus('')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save lead update.')
      setError(err.message ?? 'Failed to save remark.')
    } finally {
      setRemarkLoading(false)
    }
  }

  async function handleCreateReminder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeRemarkLead) return
    setReminderError('')
    const form = event.currentTarget
    const formData = new FormData(form)
    const dueAt = new Date(String(formData.get('due_at') ?? ''))
    if (Number.isNaN(dueAt.getTime())) {
      setReminderError('Choose a valid reminder date and time.')
      return
    }
    // datetime-local is browser-local; send a UTC timestamp to the server.
    formData.set('due_at', dueAt.toISOString())
    setReminderLoading(true)
    try {
      await createLeadReminder(workspaceId, activeRemarkLead.id, formData)
      setReminderError('')
      setSuccess('Reminder added to the assignee’s dashboard.')
      toast.success('Reminder added to the assignee’s dashboard.')
      setActiveRemarkLead(null)
      form.reset()
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Could not create this reminder.')
      setReminderError(err.message ?? 'Could not create this reminder.')
    } finally {
      setReminderLoading(false)
    }
  }

  // Helper to gather all remarks for a specific lead
  function getLeadRemarks(lead: any) {
    const leadNotes = (notes || []).filter(n => n.parent_type === 'LEAD' && n.parent_id === lead.id)
    if (leadNotes.length > 0) {
      return {
        latest: leadNotes[0],
        all: leadNotes,
      }
    }
    if (lead.notes) {
      return {
        latest: { body: lead.notes, created_at: lead.updated_at || lead.created_at, created_by_email: lead.updated_by_email || lead.created_by_email },
        all: [{ body: lead.notes, created_at: lead.updated_at || lead.created_at, created_by_email: lead.updated_by_email || lead.created_by_email }],
      }
    }
    return { latest: null, all: [] }
  }

  function openLead(lead: any) {
    setActiveRemarkLead(lead)
    setNewStatus(lead.status)
    setCustomRemark('')
    setError('')
    setReminderError('')
  }

  const filtered = leads.filter(lead => {
    if (showDeleted) return lead.status === 'DELETED'
    if (lead.status === 'DELETED') return false // Hide deleted leads in normal view
    const matchSearch = !search ||
      lead.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(search.toLowerCase()) ||
      lead.notes?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || lead.status === filterStatus
    return matchSearch && matchStatus
  })
  const openLeads = leads.filter((lead) => !['WON', 'LOST', 'DELETED', 'CONVERTED'].includes(lead.status)).length
  const newLeads = leads.filter((lead) => lead.status === 'NEW').length
  const dueLeads = leads.filter((lead) => lead.next_follow_up && new Date(`${lead.next_follow_up}T00:00:00`).getTime() <= new Date().setHours(0, 0, 0, 0) && !['WON', 'LOST', 'DELETED', 'CONVERTED'].includes(lead.status)).length

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
            Sales CRM <span className="text-slate-300">/</span> Lead management
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">Leads</h1>
          <p className="mt-1 text-sm text-slate-600">Manage prospects, follow-ups, and new opportunities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`btn btn-outline min-h-11 gap-2 ${showDeleted ? 'border-error/30 bg-error/5 text-error hover:bg-error/10' : 'border-base-300 bg-base-100 text-base-content/75'}`}
          >
            <History className="h-4 w-4" />
            {showDeleted ? 'Hide archive' : 'Archive'}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
            className="btn btn-primary min-h-11 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add lead
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="h-4 w-4 cursor-pointer" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X className="h-4 w-4 cursor-pointer" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Visible leads', value: leads.filter((lead) => lead.status !== 'DELETED').length, caption: 'Available in your workspace', icon: UsersRound, tone: 'text-indigo-700 bg-indigo-50' },
          { label: 'Open pipeline', value: openLeads, caption: 'Still being worked', icon: TrendingUp, tone: 'text-sky-700 bg-sky-50' },
          { label: 'New leads', value: newLeads, caption: 'Waiting for first contact', icon: Target, tone: 'text-amber-700 bg-amber-50' },
          { label: 'Follow-ups due', value: dueLeads, caption: 'Due today or overdue', icon: CalendarClock, tone: 'text-rose-700 bg-rose-50' },
        ].map(({ label, value, caption, icon: Icon, tone }) => (
          <div key={label} className="card card-border rounded-xl bg-base-100 p-4 transition-colors hover:border-primary/30 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-slate-600 sm:text-sm">{label}</p>
              <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">{value}</p>
            <p className="mt-1 text-[11px] text-slate-500 sm:text-xs">{caption}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
        <p className="text-xs leading-5 text-slate-700">
          {canAssignLeads
            ? 'Team view · All leads are visible. Assign ownership to manage each teammate’s pipeline.'
            : 'Personal view · Only leads assigned to you appear here. Ask a manager if you need a lead reassigned.'}
        </p>
      </div>

      {/* Add Lead Form */}
      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <h2 className="text-[15px] font-bold text-zinc-900">New Lead</h2>
            <p className="text-[13px] text-zinc-500">Fill in the details below to add a new lead.</p>
          </div>
          <form onSubmit={handleAdd} className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Company Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Company / School Name <span className="text-red-500">*</span></label>
                <input
                  name="company_name"
                  required
                  placeholder="e.g. Sunshine Playschool"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Contact Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Contact Person <span className="text-red-500">*</span></label>
                <input
                  name="contact_name"
                  required
                  placeholder="e.g. Priya Sharma"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="contact@example.com"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* City / Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">City / Location</label>
                <input
                  name="city_location"
                  type="text"
                  placeholder="e.g. Mumbai"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Investment Budget */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Investment Budget</label>
                <input
                  name="investment_budget"
                  type="text"
                  placeholder="e.g. 15-20 Lakhs"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Owns Property */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Do you own property?</label>
                <select
                  name="owns_property"
                  defaultValue=""
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="" disabled>Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Leased">Leased / Rented</option>
                </select>
              </div>

              {/* Source */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Lead Source</label>
                <select
                  name="source"
                  defaultValue="Website"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Campaign */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Campaign (Optional)</label>
                <select
                  name="campaign_id"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="">No Campaign</option>
                  {campaigns?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Assign To */}
              {(access.isSuperAdmin || ['SALES_MANAGER', 'CRM_ADMIN'].includes(access.role)) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-zinc-700">Assign To</label>
                  <select
                    name="owner_user_id"
                    defaultValue={access.userId}
                    className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value={access.userId}>Assign to Me</option>
                    {members?.filter(m => m.status === 'ACTIVE' && m.user_id !== access.userId).map(m => (
                      <option key={m.user_id} value={m.user_id}>{m.name || m.email}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Initial Remarks / Notes */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-zinc-700">Initial Remark / Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="e.g. Call not picked, scheduled follow up tomorrow at 11 AM..."
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60 transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                {pending ? 'Saving...' : 'Save Lead'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-10 rounded-full border border-zinc-200 px-6 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and pipeline filters */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search leads"
              placeholder="Search company, contact, email or phone"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <p className="px-1 text-xs text-slate-500 sm:text-right">
            <span className="font-semibold text-slate-800">{filtered.length}</span> result{filtered.length === 1 ? '' : 's'}
            {search && <> for <span className="font-medium text-slate-700">“{search}”</span></>}
          </p>
        </div>
        {!showDeleted && (
          <div role="group" aria-label="Filter leads by status" className="flex gap-1 overflow-x-auto px-3 py-2 sm:px-4">
            {['ALL', ...STATUSES].map((status) => {
              const count = status === 'ALL' ? leads.filter((lead) => lead.status !== 'DELETED').length : leads.filter((lead) => lead.status === status).length
              const selected = filterStatus === status
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFilterStatus(status)}
                  className={`btn btn-sm min-h-9 shrink-0 gap-2 border-0 capitalize ${selected ? 'btn-primary' : 'btn-ghost text-base-content/65'}`}
                >
                  {status === 'ALL' ? 'All leads' : status.toLowerCase().replace('_', ' ')}
                  <span className={`badge badge-sm ${selected ? 'badge-primary badge-soft' : 'badge-ghost'}`}>{count}</span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {/* Leads Table */}
      <div className="card card-border overflow-hidden rounded-xl bg-base-100">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500"><UsersRound className="h-5 w-5" /></span>
            <p className="text-sm font-semibold text-slate-900">{showDeleted ? 'Your archive is empty' : 'No matching leads'}</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {search || filterStatus !== 'ALL' ? 'Try a different search or status filter.' : 'Add a lead to start building your pipeline.'}
            </p>
            {!search && filterStatus === 'ALL' && !showDeleted && <button onClick={() => setShowForm(true)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><Plus className="h-4 w-4" />Add first lead</button>}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 xl:grid xl:grid-cols-[1.3fr_1.15fr_1.5fr_90px_125px_110px_40px] xl:gap-3">
              <span>Company / Contact</span>
              <span>Email / Phone</span>
              <span>Last Remark & Follow-up</span>
              <span>Source</span>
              <span>Assignee</span>
              <span>Status</span>
              <span></span>
            </div>

            {/* Rows */}
            {filtered.map(lead => {
              const { latest, all } = getLeadRemarks(lead)
              const timeAgo = formatTimeAgo(latest?.created_at || lead.updated_at)

              return (
                <div
                  key={lead.id}
                  onClick={() => {
                    setActiveRemarkLead(lead)
                    setNewStatus(lead.status)
                    setCustomRemark('')
                  }}
                  className="grid grid-cols-2 items-center gap-x-4 gap-y-3 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:grid-cols-3 sm:px-5 xl:grid-cols-[1.3fr_1.15fr_1.5fr_90px_125px_110px_40px] xl:gap-3"
                >
                  {/* Company + Contact */}
                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <button
                      type="button"
                      onClick={() => openLead(lead)}
                      className="group/title flex min-h-8 max-w-full items-center gap-1.5 rounded text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <span className="truncate text-sm font-semibold tracking-tight text-slate-900 group-hover/title:text-indigo-700">{lead.company_name}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover/title:opacity-100" />
                    </button>
                    <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                      <User className="h-3 w-3 shrink-0 text-slate-400" />
                      <p className="truncate text-xs text-slate-600">{lead.contact_name}</p>
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="col-span-1 flex min-w-0 flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
                    {lead.email && (
                      <a 
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${lead.email}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex min-h-6 min-w-0 items-center gap-1 truncate text-xs font-medium text-slate-600 hover:text-indigo-700 hover:underline"
                      >
                        <Mail className="h-3 w-3 text-blue-500" />
                        {lead.email}
                      </a>
                    )}
                    {lead.phone ? (
                      <a 
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex min-h-6 items-center gap-1 text-xs font-medium text-slate-600 hover:text-emerald-700 hover:underline"
                      >
                        <Smartphone className="h-3 w-3 text-emerald-500" />
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic inline-flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        No phone
                      </span>
                    )}
                  </div>

                  {/* Last Remark & Follow-up Activity */}
                  <div className="col-span-2 min-w-0 sm:col-span-3 xl:col-span-1">
                    {latest ? (
                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className="group/remark flex min-h-[58px] w-full items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-left transition-colors hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        title="Open lead activity and remarks"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-slate-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 line-clamp-2 leading-4 font-medium group-hover/remark:text-slate-900">
                            {latest.body}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                            {timeAgo && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {timeAgo}
                              </span>
                            )}
                            {latest.created_by_email && (
                              <span className="text-slate-500 font-semibold ml-1">
                                • {latest.created_by_email.split('@')[0]}
                              </span>
                            )}
                            {all.length > 1 && (
                              <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[9px] text-slate-700 font-semibold">
                                {all.length} logs
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className="inline-flex min-h-[58px] w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-left text-xs font-medium text-slate-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Log remark / follow-up</span>
                      </button>
                    )}
                  </div>

                  {/* Source */}
                  <div className="col-span-1 flex items-center gap-1.5 text-xs text-slate-600">
                    <SourceIcon source={lead.source} />
                    <span className="text-xs text-slate-500">{lead.source || 'Website'}</span>
                  </div>

                  {/* Assignee dropdown */}
                  <div className="col-span-1 min-w-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={pending || (!access.isSuperAdmin && access.role !== 'SALES_MANAGER' && access.role !== 'CRM_ADMIN')}
                        className="flex min-h-9 w-full min-w-0 items-center justify-between gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-default disabled:opacity-80 xl:min-h-8"
                      >
                        <span className="truncate">
                          {lead.owner_user_id === access.userId ? 'You' : lead.owner_user_id ? members?.find(m => m.user_id === lead.owner_user_id)?.name || 'Unknown' : 'Unassigned'}
                        </span>
                        {canAssignLeads && <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] p-1 shadow-md border-slate-200 rounded-md">
                        {members?.filter(m => m.status === 'ACTIVE' && m.user_id).map(m => (
                          <DropdownMenuItem key={m.user_id} onClick={() => handleAssignChange(lead.id, m.user_id)} className="text-sm font-medium cursor-pointer py-2 rounded-sm">
                            {m.name || m.email}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status dropdown */}
                  <div className="col-span-1">
                    {lead.status === 'DELETED' ? (
                      <span className="rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">Deleted</span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={pending}
                          className={`badge badge-soft min-h-8 cursor-pointer gap-1.5 border-0 px-2.5 text-[10px] font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${statusColors[lead.status] ?? 'badge-neutral'}`}
                        >
                          {lead.status.toLowerCase().replace('_', ' ')}
                          <ChevronDown className="h-3 w-3 opacity-70" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="p-1 shadow-md border-slate-200 min-w-[120px] rounded-md">
                          {STATUSES.map(s => (
                            <DropdownMenuItem key={s} onClick={() => handleStatusChange(lead.id, s)} className="text-sm font-medium cursor-pointer py-2 rounded-sm">
                              {s.toLowerCase().replace('_', ' ')}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={pending}
                      aria-label={`Archive ${lead.company_name}`}
                      className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50 disabled:opacity-50"
                      title="Archive lead"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── REMARK & FOLLOW-UP MODAL ────────────────────────────────────────────── */}
      <Dialog open={!!activeRemarkLead} onOpenChange={(open) => { if (!open) setActiveRemarkLead(null) }}>
      {activeRemarkLead && (
        <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 bg-white p-0 shadow-2xl sm:rounded-2xl">
            {/* Modal Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 pr-14 sm:px-6 sm:pr-16">
              <div className="flex min-w-0 items-start gap-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-base font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                  {(activeRemarkLead.company_name || '?').slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-700">Lead record</p>
                  <DialogTitle id="lead-details-title" className="break-words text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">{activeRemarkLead.company_name}</DialogTitle>
                  <DialogDescription className="sr-only">Lead details, activity notes, and reminder scheduling.</DialogDescription>
                  <p className="mt-0.5 text-sm text-slate-600">{activeRemarkLead.contact_name}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    {activeRemarkLead.email && <span className="break-all">{activeRemarkLead.email}</span>}
                    {activeRemarkLead.phone && <span>{activeRemarkLead.phone}</span>}
                    {activeRemarkLead.city_location && <span>{activeRemarkLead.city_location}</span>}
                    {activeRemarkLead.investment_budget && <span>Budget · {activeRemarkLead.investment_budget}</span>}
                    {activeRemarkLead.owns_property && <span>Property · {activeRemarkLead.owns_property}</span>}
                    {activeRemarkLead.source && <span>Source · {activeRemarkLead.source}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 overflow-y-auto lg:grid-cols-2">
              <section className="space-y-5 border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
              {/* Quick 1-Click Action Chips */}
              <div>
                <div className="mb-2.5 flex items-baseline justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-900">Quick notes</h4>
                  <span className="text-[11px] text-slate-500">Saves immediately</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_REMARKS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={remarkLoading}
                      onClick={() => handleSaveRemark(preset.text)}
                      className={`inline-flex min-h-9 items-center rounded-lg border px-3 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-wait disabled:opacity-50 ${preset.color}`}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Remark Box */}
              <div className="space-y-2">
                <label htmlFor="lead-remark" className="block text-sm font-semibold text-slate-900">Add a note</label>
                <textarea
                  id="lead-remark"
                  value={customRemark}
                  onChange={e => setCustomRemark(e.target.value)}
                  placeholder="Add a call summary, client request, or next step…"
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Optional Status Update */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Lead status</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Update while recording your note</p>
                </div>
                <select
                  aria-label="Update lead status"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold capitalize text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.toLowerCase().replace('_', ' ')}</option>)}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setActiveRemarkLead(null)} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/50">Close</button>
                <button
                  type="button"
                  disabled={remarkLoading || (!customRemark.trim() && newStatus === activeRemarkLead.status)}
                  onClick={() => handleSaveRemark()}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {remarkLoading ? 'Saving…' : customRemark.trim() && newStatus !== activeRemarkLead.status ? 'Save note & status' : newStatus !== activeRemarkLead.status ? 'Update status' : 'Save note'}
                </button>
              </div>
              </section>

              <aside className="space-y-5 bg-slate-50/60 p-5 sm:p-6">

              <form key={activeRemarkLead.id} onSubmit={handleCreateReminder} className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                {reminderError && <p role="alert" className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium leading-5 text-rose-800">{reminderError}</p>}
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-700 ring-1 ring-indigo-100">
                    <BellPlus className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-900">Next follow-up</h4>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">Add a reminder to the assigned teammate’s dashboard.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="reminder-subject" className="text-xs font-medium text-slate-700">Reminder</label>
                    <input id="reminder-subject" name="subject" required maxLength={120} defaultValue={`Call ${activeRemarkLead.contact_name || activeRemarkLead.company_name}`} placeholder="Call the client" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="reminder-date" className="text-xs font-medium text-slate-700">Date and time</label>
                    <input id="reminder-date" name="due_at" type="datetime-local" required className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="reminder-details" className="text-xs font-medium text-slate-700">Call notes <span className="font-normal text-slate-500">(optional)</span></label>
                    <input id="reminder-details" name="details" maxLength={2000} placeholder="Ask about the demo" className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="submit" disabled={reminderLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                    <CalendarClock className="h-4 w-4" />
                    {reminderLoading ? 'Scheduling…' : 'Set reminder'}
                  </button>
                </div>
              </form>

              {/* Remark History Timeline */}
              {(() => {
                const { all } = getLeadRemarks(activeRemarkLead)
                if (all.length === 0) return (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
                    <MessageSquare className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">No notes yet</p>
                    <p className="mt-1 text-xs text-slate-500">Your saved notes will appear here.</p>
                  </div>
                )

                return (
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">Recent notes</h4>
                        <p className="mt-0.5 text-xs text-slate-500">{all.length} saved note{all.length === 1 ? '' : 's'}</p>
                      </div>
                      <History className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                      {all.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3.5">
                          <p className="whitespace-pre-wrap text-sm leading-5 text-slate-800">{item.body}</p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span>{item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Initial note'}</span>
                            {item.created_by_email && (
                              <span className="max-w-[180px] truncate">{item.created_by_email}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
              </aside>
            </div>
        </DialogContent>
      )}
      </Dialog>
    </div>
  )
}
