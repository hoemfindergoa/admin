'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addLead, updateLeadStatus, deleteLead, addLeadRemark, assignLead } from './actions'
import {
  Globe, Instagram, Facebook, Mail, Smartphone, Linkedin, Twitter,
  Plus, Trash2, ChevronDown, MessageSquare, Clock, CheckCircle2,
  PhoneCall, AlertCircle, Sparkles, X, History, User, Send
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const SOURCES = ['Website', 'Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'Email', 'Phone', 'Referral', 'Walk-in', 'Other']
const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  CONTACTED: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  QUALIFIED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  PROPOSAL: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
  NEGOTIATION: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
  WON: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
  LOST: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
}

const PRESET_REMARKS = [
  { text: 'Follow-up taken - discussed details', label: 'Follow-up Taken', icon: '🔄', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80 hover:border-blue-300' },
  { text: 'Call not picked / Unreachable', label: 'Call Not Picked', icon: '📞', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80 hover:border-amber-300' },
  { text: 'No response to call/message', label: 'No Response', icon: '⏳', color: 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300' },
  { text: 'Busy - requested call back later', label: 'Call Later', icon: '⏰', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100/80 hover:border-purple-300' },
  { text: 'WhatsApp message sent with details', label: 'WhatsApp Sent', icon: '💬', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300' },
  { text: 'Interested - demo / meeting requested', label: 'Interested / Demo', icon: '✨', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100/80 hover:border-green-300' },
  { text: 'Not interested / Not relevant now', label: 'Not Interested', icon: '❌', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80 hover:border-rose-300' },
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
        setSuccess('Lead added successfully!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to add lead.')
      }
    })
  }

  function handleStatusChange(leadId: string, status: string) {
    startTransition(async () => {
      try {
        await updateLeadStatus(workspaceId, leadId, status)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to update status.')
      }
    })
  }

  function handleAssignChange(leadId: string, ownerUserId: string) {
    startTransition(async () => {
      try {
        await assignLead(workspaceId, leadId, ownerUserId)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to assign lead.')
      }
    })
  }

  function handleDelete(leadId: string) {
    if (!confirm('Delete this lead?')) return
    startTransition(async () => {
      try {
        await deleteLead(workspaceId, leadId)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to delete lead.')
      }
    })
  }

  async function handleSaveRemark(remarkTextToSave?: string) {
    if (!activeRemarkLead) return
    const text = (remarkTextToSave || customRemark).trim()
    if (!text) return

    setRemarkLoading(true)
    setError('')
    try {
      await addLeadRemark(workspaceId, activeRemarkLead.id, text)
      if (newStatus && newStatus !== activeRemarkLead.status) {
        await updateLeadStatus(workspaceId, activeRemarkLead.id, newStatus)
      }
      setSuccess('Remark recorded!')
      setCustomRemark('')
      setActiveRemarkLead(null)
      setNewStatus('')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? 'Failed to save remark.')
    } finally {
      setRemarkLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-600">CRM</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Leads & Follow-ups</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Track prospective clients, follow-up status, and last activity remarks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all active:scale-95 cursor-pointer ${showDeleted ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}
          >
            <History className="h-4 w-4" />
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Lead
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
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Assign To</label>
                <select
                  name="owner_user_id"
                  defaultValue={access.userId}
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value={access.userId}>Assign to Me</option>
                  {members?.filter(m => m.user_id !== access.userId).map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.name || m.email}</option>
                  ))}
                </select>
              </div>

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
                className="inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-6 text-[14px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-all active:scale-95 cursor-pointer"
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

      {/* Filters & Counter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <input
            type="text"
            placeholder="Search company, contact, phone, or remarks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9.5 w-full max-w-md rounded-full border border-zinc-200 bg-white px-4 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
          />
          {!showDeleted && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-9.5 items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer">
                {filterStatus === 'ALL' ? 'All Statuses' : filterStatus.toLowerCase().replace('_', ' ')}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={() => setFilterStatus('ALL')} className="text-[13px] font-medium cursor-pointer py-2">
                  All Statuses ({leads.length})
                </DropdownMenuItem>
                {STATUSES.map(s => (
                  <DropdownMenuItem key={s} onClick={() => setFilterStatus(s)} className="text-[13px] font-medium cursor-pointer py-2">
                    {s.toLowerCase().replace('_', ' ')} ({leads.filter(l => l.status === s).length})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-[12px] font-medium text-zinc-500">
          Showing {filtered.length} of {leads.length} leads
        </p>
      </div>

      {/* Leads Table */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
            <Globe className="mb-3 h-10 w-10 text-zinc-200" />
            <p className="text-[15px] font-semibold text-zinc-700">No leads found</p>
            <p className="mt-1 text-[13px] text-zinc-400">
              {search || filterStatus !== 'ALL' ? 'Try adjusting your search filters.' : 'Click "Add Lead" above to get started.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-[1.6fr_1.3fr_2fr_100px_130px_120px_50px] gap-4 bg-zinc-50/80 px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
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
                  className="grid grid-cols-1 lg:grid-cols-[1.6fr_1.3fr_2fr_100px_130px_120px_50px] gap-3 lg:gap-4 px-6 py-4 hover:bg-zinc-50/60 transition-colors items-start lg:items-center cursor-pointer"
                >
                  {/* Company + Contact */}
                  <div>
                    <p className="text-[14px] font-bold text-zinc-900">{lead.company_name}</p>
                    <p className="text-[12px] text-zinc-500 mt-0.5">{lead.contact_name}</p>
                  </div>

                  {/* Email + Phone */}
                  <div>
                    {lead.email && <p className="text-[13px] text-zinc-700 truncate">{lead.email}</p>}
                    {lead.phone ? (
                      <p className="text-[12px] font-medium text-zinc-600 mt-0.5 flex items-center gap-1">
                        <Smartphone className="h-3 w-3 text-zinc-400" />
                        {lead.phone}
                      </p>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">No phone</span>
                    )}
                  </div>

                  {/* Last Remark & Follow-up Activity */}
                  <div className="flex flex-col gap-1">
                    {latest ? (
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveRemarkLead(lead)
                          setNewStatus(lead.status)
                          setCustomRemark(latest.body || '')
                        }}
                        className="group/remark flex items-start gap-2 rounded-xl bg-zinc-50/80 border border-zinc-200/80 p-2 text-left hover:bg-indigo-50/40 hover:border-indigo-200 transition-all"
                        title="Click to view history or edit remark"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-indigo-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-zinc-800 line-clamp-2 leading-tight font-medium group-hover/remark:text-indigo-950">
                            {latest.body}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
                            {timeAgo && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {timeAgo}
                              </span>
                            )}
                            {latest.created_by_email && (
                              <span className="text-zinc-500 font-semibold ml-1">
                                • {latest.created_by_email.split('@')[0]}
                              </span>
                            )}
                            {all.length > 1 && (
                              <span className="rounded-full bg-zinc-200/70 px-1.5 py-0.2 text-[9px] text-zinc-600 font-semibold">
                                {all.length} logs
                              </span>
                            )}
                            <span className="text-indigo-600 opacity-0 group-hover/remark:opacity-100 transition-opacity font-semibold">
                              + Update
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveRemarkLead(lead)
                          setNewStatus(lead.status)
                          setCustomRemark('')
                        }}
                        className="inline-flex items-center gap-1.5 text-left text-[12px] font-medium text-zinc-400 hover:text-indigo-600 rounded-lg py-1 px-2 border border-dashed border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Log remark / follow-up</span>
                      </button>
                    )}
                  </div>

                  {/* Source */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <SourceIcon source={lead.source} />
                    <span className="text-[12px] text-zinc-500">{lead.source || 'Website'}</span>
                  </div>

                  {/* Assignee dropdown */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={pending || (!access.isSuperAdmin && access.role !== 'SALES_MANAGER' && access.role !== 'CRM_ADMIN' && lead.owner_user_id !== access.userId)}
                        className="flex w-full max-w-[130px] items-center justify-between rounded-lg border-zinc-200 bg-zinc-50/50 px-2 py-1 text-[12px] font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="truncate">
                          {lead.owner_user_id ? members?.find(m => m.user_id === lead.owner_user_id)?.name || 'Unknown' : 'Unassigned'}
                        </span>
                        <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[180px] p-1 shadow-lg border-zinc-200">
                        {members?.map(m => (
                          <DropdownMenuItem key={m.user_id} onClick={() => handleAssignChange(lead.id, m.user_id)} className="text-[13px] font-medium cursor-pointer py-2">
                            {m.name || m.email}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status dropdown */}
                  <div onClick={(e) => e.stopPropagation()}>
                    {lead.status === 'DELETED' ? (
                      <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide border-0 bg-rose-100 text-rose-700">Deleted</span>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={pending}
                          className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${statusColors[lead.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                        >
                          {lead.status.toLowerCase().replace('_', ' ')}
                          <ChevronDown className="h-3 w-3 opacity-70" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="p-1 shadow-lg border-zinc-200 min-w-[120px]">
                          {STATUSES.map(s => (
                            <DropdownMenuItem key={s} onClick={() => handleStatusChange(lead.id, s)} className="text-[12px] font-semibold uppercase tracking-wider cursor-pointer py-2">
                              {s.toLowerCase().replace('_', ' ')}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={pending}
                      className="rounded-full p-2 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete lead"
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
      {activeRemarkLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-4 flex items-start justify-between">
              <div className="flex-1 pr-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-1">Lead Details & History</p>
                <h3 className="text-xl font-bold text-zinc-900">{activeRemarkLead.company_name}</h3>
                <p className="text-[13px] font-medium text-zinc-600 mt-0.5">Contact: {activeRemarkLead.contact_name}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4 text-[12px] text-zinc-700 bg-white shadow-sm ring-1 ring-zinc-200/50 p-3.5 rounded-xl">
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Email</span><span className="font-semibold truncate">{activeRemarkLead.email || '—'}</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Phone</span><span className="font-semibold truncate">{activeRemarkLead.phone || '—'}</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Location</span><span className="font-semibold truncate">{activeRemarkLead.city_location || '—'}</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Budget</span><span className="font-semibold truncate">{activeRemarkLead.investment_budget || '—'}</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Property</span><span className="font-semibold truncate">{activeRemarkLead.owns_property || '—'}</span></div>
                  <div className="flex flex-col"><span className="text-[10px] uppercase font-bold text-zinc-400 mb-0.5">Source</span><span className="font-semibold truncate">{activeRemarkLead.source || '—'}</span></div>
                </div>
              </div>
              <button
                onClick={() => setActiveRemarkLead(null)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Quick 1-Click Action Chips */}
              <div>
                <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block">
                  Quick Remarks (1-Click)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_REMARKS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={remarkLoading}
                      onClick={() => handleSaveRemark(preset.text)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer ${preset.color}`}
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Remark Box */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Custom Remark or Detailed Notes
                </label>
                <textarea
                  value={customRemark}
                  onChange={e => setCustomRemark(e.target.value)}
                  placeholder="e.g. Spoke to Mr. Sharma. Requested brochure via WhatsApp. Follow up on Monday at 3 PM..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                />
              </div>

              {/* Optional Status Update */}
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 p-3">
                <span className="text-[13px] font-semibold text-zinc-700">Update Lead Status:</span>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-semibold text-zinc-800 shadow-2xs focus:border-indigo-400 focus:outline-none cursor-pointer"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{s.toLowerCase().replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={remarkLoading || !customRemark.trim()}
                  onClick={() => handleSaveRemark()}
                  className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 text-[14px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {remarkLoading ? 'Saving...' : 'Save Remark'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRemarkLead(null)}
                  className="h-10 rounded-full border border-zinc-200 px-5 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Remark History Timeline */}
              {(() => {
                const { all } = getLeadRemarks(activeRemarkLead)
                if (all.length === 0) return null

                return (
                  <div className="border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-700 mb-3">
                      <History className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Remark & Activity History ({all.length})</span>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {all.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-zinc-100 bg-zinc-50/70 p-3 text-[13px]">
                          <p className="font-medium text-zinc-800">{item.body}</p>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
                            <span>{item.created_at ? new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Initial note'}</span>
                            {item.created_by_email && (
                              <span className="truncate max-w-[150px]">{item.created_by_email}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
