'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Clock3, ExternalLink } from 'lucide-react'
import { completeActivity } from '@/app/crm/[workspaceId]/activities/actions'

type ReminderActivity = {
  id: string
  subject: string
  details?: string | null
  due_at?: string | null
  reminder_at?: string | null
  lead_id?: string | null
}

export function CrmRemindersPanel({
  workspaceId,
  activities,
  leadNames,
}: {
  workspaceId: string
  activities: ReminderActivity[]
  leadNames: Record<string, string>
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function markDone(id: string) {
    setError('')
    setPendingId(id)
    startTransition(async () => {
      try {
        await completeActivity(workspaceId, id)
        router.refresh()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not complete this reminder.')
      } finally {
        setPendingId(null)
      }
    })
  }

  if (activities.length === 0) {
    return (
      <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
        <Clock3 className="mb-2 h-5 w-5 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">You’re all caught up</p>
        <p className="mt-1 text-xs text-slate-500">Reminders you schedule on leads will show up here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}
      {activities.map((item) => {
        const scheduledAt = item.reminder_at ?? item.due_at
        const overdue = !!scheduledAt && new Date(scheduledAt).getTime() < Date.now()
        return (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300">
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${overdue ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'}`}>
                <Clock3 className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-slate-900">{item.subject}</p>
                {item.lead_id && leadNames[item.lead_id] && <p className="mt-0.5 truncate text-xs text-slate-600">{leadNames[item.lead_id]}</p>}
                {item.details && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.details}</p>}
                {scheduledAt && (
                  <p className={`mt-2 text-xs font-medium ${overdue ? 'text-rose-700' : 'text-slate-500'}`}>
                    {overdue ? 'Overdue · ' : ''}{new Date(scheduledAt).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              {item.lead_id ? (
                <a href={`/crm/${workspaceId}/leads`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  Open lead <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : <span />}
              <button
                type="button"
                disabled={pending || pendingId === item.id}
                onClick={() => markDone(item.id)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-1 disabled:cursor-wait disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
                {pendingId === item.id ? 'Saving…' : 'Mark done'}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
