'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addActivity, completeActivity, deleteActivity } from './actions'
import { CalendarCheck, Plus, Trash2, CheckCircle, Clock } from 'lucide-react'

const KINDS = ['TASK', 'CALL', 'EMAIL', 'MEETING']

export function ActivitiesPage({ workspaceId, activities }: { workspaceId: string, activities: any[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(''); setSuccess('')
    const formData = new FormData(e.currentTarget)
    const subject = String(formData.get('subject') ?? '').trim()
    if (!subject) { setError('Subject is required.'); return }

    startTransition(async () => {
      try {
        await addActivity(workspaceId, formData)
        setSuccess('Activity created!')
        setShowForm(false)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to create activity.')
      }
    })
  }

  function handleComplete(id: string) {
    startTransition(async () => {
      try {
        await completeActivity(workspaceId, id)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to complete.')
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this activity?')) return
    startTransition(async () => {
      try {
        await deleteActivity(workspaceId, id)
        router.refresh()
      } catch (err: any) {
        setError(err.message ?? 'Failed to delete.')
      }
    })
  }

  const upcoming = activities.filter(a => !a.completed_at)
  const completed = activities.filter(a => a.completed_at)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-600">CRM</p>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Activities</h1>
          <p className="text-[13px] text-zinc-500 mt-1">{upcoming.length} upcoming tasks</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Activity
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">{success}</div>}

      {showForm && (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
            <h2 className="text-[15px] font-bold text-zinc-900">New Activity</h2>
          </div>
          <form onSubmit={handleAdd} className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-zinc-700">Subject <span className="text-red-500">*</span></label>
                <input name="subject" required placeholder="e.g. Follow up on proposal" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Type</label>
                <select name="kind" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]">
                  {KINDS.map(k => <option key={k} value={k}>{k.charAt(0) + k.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Due Date</label>
                <input name="due_at" type="datetime-local" className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-[14px]" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[13px] font-semibold text-zinc-700">Details</label>
                <textarea name="details" rows={3} className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[14px]" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="submit" disabled={pending} className="h-10 rounded-full bg-indigo-600 px-6 text-[14px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-all">{pending ? 'Saving...' : 'Save Activity'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-full border border-zinc-200 px-6 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-[14px] font-bold uppercase tracking-widest text-zinc-400 mb-4 px-2">Upcoming</h2>
          <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden">
            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center text-zinc-500">
                <Clock className="mb-3 h-8 w-8 text-zinc-200" />
                <p className="text-[14px] font-medium text-zinc-700">No upcoming tasks</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {upcoming.map(a => (
                  <div key={a.id} className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 hover:bg-zinc-50/50 items-center">
                    <button onClick={() => handleComplete(a.id)} disabled={pending} className="h-6 w-6 rounded-full border-2 border-zinc-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center text-transparent hover:text-emerald-500">
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">{a.kind}</span>
                        <p className="text-[14px] font-bold text-zinc-900">{a.subject}</p>
                      </div>
                      {a.due_at && <p className="text-[12px] text-zinc-500 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(a.due_at).toLocaleString()}</p>}
                    </div>
                    <button onClick={() => handleDelete(a.id)} disabled={pending} className="text-zinc-400 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {completed.length > 0 && (
          <section>
            <h2 className="text-[14px] font-bold uppercase tracking-widest text-zinc-400 mb-4 px-2">Completed</h2>
            <div className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden opacity-60">
              <div className="divide-y divide-zinc-100">
                {completed.map(a => (
                  <div key={a.id} className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-3 items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-[13px] font-medium text-zinc-700 line-through">{a.subject}</p>
                      <p className="text-[11px] text-zinc-400">Completed {new Date(a.completed_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(a.id)} disabled={pending} className="text-zinc-400 hover:text-red-500 p-2"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
