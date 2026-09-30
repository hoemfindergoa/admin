'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addCampaign, updateCampaignStatus, deleteCampaign } from './actions'
import { Megaphone, Plus, Trash2 } from 'lucide-react'

const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Instagram', 'Facebook', 'Google Ads', 'Referral', 'Event', 'Other']
const STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']

const statusColors: Record<string, string> = {
  DRAFT:     'bg-zinc-100 text-zinc-600',
  ACTIVE:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  PAUSED:    'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  COMPLETED: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
}

const money = (v: any) => v ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v)) : '—'
const fmtDate = (v?: string | null) => v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

export function CampaignsPage({
  workspaceId,
  campaigns,
  members,
}: {
  workspaceId: string
  campaigns: any[]
  members: any[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    if (!name) { setError('Campaign name is required.'); return }

    startTransition(async () => {
      try {
        await addCampaign(workspaceId, formData)
        setSuccess('Campaign created!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to create campaign.')
      }
    })
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      try {
        await updateCampaignStatus(workspaceId, id, status)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to update.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this campaign?')) return
    startTransition(async () => {
      try {
        await deleteCampaign(workspaceId, id)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to delete.')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-600">CRM</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Campaigns</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{campaigns.length} total campaigns</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Campaign
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">{success}</div>}

      {/* Add Form */}
      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <h2 className="text-[15px] font-bold text-zinc-900">New Campaign</h2>
          </div>
          <form onSubmit={handleAdd} className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-zinc-700">Campaign Name <span className="text-red-500">*</span></label>
                <input name="name" required placeholder="e.g. Summer Admissions Drive"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Channel</label>
                <select name="channel" defaultValue="Email"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                  {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Status</label>
                <select name="status" defaultValue="DRAFT"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Start Date</label>
                <input name="start_date" type="date"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">End Date</label>
                <input name="end_date" type="date"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Budget (₹)</label>
                <input name="budget" type="number" min="0" placeholder="0"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Assign To</label>
                <select name="owner_user_id"
                  className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px] text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all">
                  <option value="">Unassigned</option>
                  {members?.map(m => <option key={m.user_id} value={m.user_id}>{m.name || m.email || m.user_id}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button type="submit" disabled={pending}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-indigo-600 px-6 text-[14px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-all active:scale-95">
                {pending ? 'Saving...' : 'Save Campaign'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="h-10 rounded-full border border-zinc-200 px-6 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
            <Megaphone className="mb-3 h-10 w-10 text-zinc-200" />
            <p className="text-[15px] font-semibold text-zinc-700">No campaigns yet</p>
            <p className="mt-1 text-[13px] text-zinc-400">Click "Add Campaign" above to create your first one.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 bg-zinc-50/80 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              <span>Campaign</span>
              <span>Channel</span>
              <span>Dates</span>
              <span>Budget</span>
              <span>Status</span>
              <span></span>
            </div>

            {campaigns.map(c => (
              <div key={c.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-3 sm:gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors items-center">
                <div>
                  <p className="text-[14px] font-bold text-zinc-900">{c.name}</p>
                </div>

                <div>
                  <span className="text-[13px] text-zinc-600">{c.channel || '—'}</span>
                </div>

                <div>
                  <p className="text-[12px] text-zinc-500">{fmtDate(c.start_date)}</p>
                  {c.end_date && <p className="text-[11px] text-zinc-400">→ {fmtDate(c.end_date)}</p>}
                </div>

                <div>
                  <span className="text-[13px] font-medium text-zinc-700">{money(c.budget)}</span>
                </div>

                <div>
                  <select
                    value={c.status}
                    onChange={e => handleStatusChange(c.id, e.target.value)}
                    disabled={pending}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${statusColors[c.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => handleDelete(c.id)} disabled={pending}
                    className="rounded-full p-2 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
