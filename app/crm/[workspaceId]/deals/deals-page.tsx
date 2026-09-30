'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addDeal, updateDealStage, deleteDeal } from './actions'
import { Briefcase, Plus, Trash2, Calendar } from 'lucide-react'

const STAGES = [
  { id: 'QUALIFICATION', label: 'Qualification' },
  { id: 'NEEDS_ANALYSIS', label: 'Needs analysis' },
  { id: 'PROPOSAL', label: 'Proposal' },
  { id: 'NEGOTIATION', label: 'Negotiation' },
  { id: 'CLOSED_WON', label: 'Closed won' },
  { id: 'CLOSED_LOST', label: 'Closed lost' }
]

const money = (v: any) => v ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v)) : '—'

export function DealsPage({ workspaceId, deals, accounts, contacts, leads }: { workspaceId: string, deals: any[], accounts: any[], contacts: any[], leads: any[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<'board' | 'list'>('board')

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setSuccess('')
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    if (!name) { setError('Deal name is required.'); return }

    startTransition(async () => {
      try {
        await addDeal(workspaceId, formData)
        setSuccess('Deal created!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to create deal.')
      }
    })
  }

  function handleStageChange(id: string, stage: string) {
    startTransition(async () => {
      try {
        await updateDealStage(workspaceId, id, stage)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to update.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this deal?')) return
    startTransition(async () => {
      try {
        await deleteDeal(workspaceId, id)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to delete.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-600">CRM</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Deals</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{deals.length} total deals • {money(deals.reduce((a, b) => a + (b.value || 0), 0))}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Deal
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">{success}</div>}

      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <h2 className="text-[15px] font-bold text-zinc-900">New Deal</h2>
          </div>
          <form onSubmit={handleAdd} className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-zinc-700">Deal Name <span className="text-red-500">*</span></label>
                <input name="name" required placeholder="e.g. Website Redesign Q3" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Value (₹)</label>
                <input name="value" type="number" min="0" placeholder="0" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Stage</label>
                <select name="stage" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]">
                  {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="submit" disabled={pending} className="h-10 rounded-full bg-indigo-600 px-6 text-[14px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-all">{pending ? 'Saving...' : 'Save Deal'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-full border border-zinc-200 px-6 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex bg-zinc-100 p-1 w-fit rounded-lg">
        <button onClick={() => setView('board')} className={`px-4 py-1.5 text-[13px] font-medium rounded-md ${view === 'board' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>Board</button>
        <button onClick={() => setView('list')} className={`px-4 py-1.5 text-[13px] font-medium rounded-md ${view === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>List</button>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/60 bg-white flex flex-col items-center py-16 text-center text-zinc-500 shadow-sm">
          <Briefcase className="mb-3 h-10 w-10 text-zinc-200" />
          <p className="text-[15px] font-semibold text-zinc-700">No deals yet</p>
        </div>
      ) : view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {STAGES.map(stage => (
            <div key={stage.id} className="w-[300px] shrink-0 bg-zinc-100/80 rounded-xl p-3 border border-zinc-200/50">
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-[13px] font-bold text-zinc-700">{stage.label}</h3>
                <span className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-500 shadow-sm">
                  {deals.filter(d => d.stage === stage.id).length}
                </span>
              </div>
              <div className="space-y-3">
                {deals.filter(d => d.stage === stage.id).map(d => (
                  <div key={d.id} className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 hover:border-indigo-300 transition-colors group">
                    <p className="text-[14px] font-bold text-zinc-900">{d.name}</p>
                    <p className="text-[14px] font-medium text-emerald-600 mt-1">{money(d.value)}</p>
                    <select 
                      value={d.stage} 
                      onChange={e => handleStageChange(d.id, e.target.value)}
                      disabled={pending}
                      className="mt-3 w-full text-[12px] bg-zinc-50 border border-zinc-200 rounded-md py-1 px-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden divide-y divide-zinc-100">
          {deals.map(d => (
            <div key={d.id} className="grid grid-cols-[1fr_auto_auto] gap-6 px-6 py-4 items-center hover:bg-zinc-50/50">
              <div>
                <p className="text-[15px] font-bold text-zinc-900">{d.name}</p>
                <p className="text-[14px] font-medium text-emerald-600 mt-0.5">{money(d.value)}</p>
              </div>
              <select 
                value={d.stage} 
                onChange={e => handleStageChange(d.id, e.target.value)}
                disabled={pending}
                className="text-[13px] bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-3"
              >
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <button onClick={() => handleDelete(d.id)} disabled={pending} className="text-zinc-400 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
