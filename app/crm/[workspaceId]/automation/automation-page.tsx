'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addAutomationRule, toggleAutomationRule, deleteAutomationRule } from './actions'
import { Settings2, Plus, Trash2, Zap, Power } from 'lucide-react'

export function AutomationPage({ workspaceId, rules }: { workspaceId: string, rules: any[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setSuccess('')
    const formData = new FormData(e.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    if (!name) { setError('Rule name is required.'); return }

    startTransition(async () => {
      try {
        await addAutomationRule(workspaceId, formData)
        setSuccess('Rule created!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to create rule.')
      }
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      try {
        await toggleAutomationRule(workspaceId, id, !current)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to toggle.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this rule?')) return
    startTransition(async () => {
      try {
        await deleteAutomationRule(workspaceId, id)
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
          <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-600">CRM Settings</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Automation</h1>
          <p className="text-[13px] text-zinc-500 mt-1">Automatically create tasks when events happen.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Rule
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">{success}</div>}

      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <h2 className="text-[15px] font-bold text-zinc-900">New Automation Rule</h2>
          </div>
          <form onSubmit={handleAdd} className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-zinc-700">Rule Name <span className="text-red-500">*</span></label>
                <input name="name" required placeholder="e.g. Lead Follow-up" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">When this happens</label>
                <select name="trigger_event" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]">
                  <option value="LEAD_CREATED">A new lead is created</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Create a task titled</label>
                <input name="task_subject" required placeholder="e.g. Call to say hello" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Due in (days)</label>
                <input name="days_after" type="number" min="0" defaultValue="1" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="submit" disabled={pending} className="h-10 rounded-full bg-indigo-600 px-6 text-[14px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-all">{pending ? 'Saving...' : 'Save Rule'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-full border border-zinc-200 px-6 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
        {rules.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center text-zinc-500">
            <Zap className="mb-3 h-10 w-10 text-zinc-200" />
            <p className="text-[15px] font-semibold text-zinc-700">No automation rules</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {rules.map(r => (
              <div key={r.id} className="grid grid-cols-[1fr_auto_auto] gap-6 px-6 py-4 items-center hover:bg-zinc-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-zinc-900">{r.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                      {r.enabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-[13px] text-zinc-500 mt-1">
                    When <span className="font-medium text-zinc-700">{r.trigger_event === 'LEAD_CREATED' ? 'a lead is created' : r.trigger_event}</span>, 
                    create task "<span className="font-medium text-zinc-700">{r.task_subject}</span>" due in {r.days_after} day(s).
                  </p>
                </div>
                <button onClick={() => handleToggle(r.id, r.enabled)} disabled={pending} className={`p-2 rounded-full border ${r.enabled ? 'text-amber-500 hover:bg-amber-50 border-amber-200' : 'text-emerald-500 hover:bg-emerald-50 border-emerald-200'}`} title={r.enabled ? 'Pause rule' : 'Activate rule'}>
                  <Power className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(r.id)} disabled={pending} className="text-zinc-400 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
