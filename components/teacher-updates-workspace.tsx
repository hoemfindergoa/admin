'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Award, BookOpenCheck, CalendarDays, Plus, Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { createTeacherClassUpdate } from '@/app/teacher/[orgId]/actions'

type UpdateKind = 'HOMEWORK' | 'MOTIVATION'

export function TeacherUpdatesWorkspace({ orgId, data }: { orgId: string; data: any }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [kind, setKind] = useState<UpdateKind>('HOMEWORK')
  const [selectedClassId, setSelectedClassId] = useState(data.classes[0]?.id ?? '')
  const [filterClassId, setFilterClassId] = useState('all')
  const [composerOpen, setComposerOpen] = useState(false)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('kind', kind)
    startTransition(async () => {
      try {
        await createTeacherClassUpdate(orgId, formData)
        toast.success(kind === 'HOMEWORK' ? 'Homework shared with parents.' : 'Motivation note shared with parents.')
        form.reset()
        setKind('HOMEWORK')
        setSelectedClassId(data.classes[0]?.id ?? '')
        setComposerOpen(false)
        router.refresh()
      } catch (cause) {
        toast.error(cause instanceof Error ? cause.message : 'Could not publish this update.')
      }
    })
  }

  const className = (id: string) => data.classes.find((item: any) => item.id === id)?.name ?? 'Class'
  const sectionName = (id: string | null) => data.sections.find((item: any) => item.id === id)?.name ?? 'All sections'
  const filteredUpdates = filterClassId === 'all'
    ? data.classUpdates ?? []
    : (data.classUpdates ?? []).filter((item: any) => item.class_id === filterClassId)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-lg font-semibold">Class updates</h2><p className="text-sm text-base-content/65">Homework and notes shared with families.</p></div>
        <button type="button" className={`btn btn-sm sm:btn-md ${composerOpen ? 'btn-ghost' : 'btn-primary'}`} onClick={() => setComposerOpen((open) => !open)}>
          {composerOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{composerOpen ? 'Close' : 'Share an update'}
        </button>
      </div>

      {composerOpen && <section className="card card-border bg-base-100 shadow-sm">
        <div className="card-body p-5 sm:p-6">
          <div>
            <h2 className="card-title">New class update</h2>
            <p className="mt-1 text-sm text-base-content/70">Choose the class and section whose families should receive this update.</p>
          </div>
          {!data.classes.length ? <div className="alert alert-warning mt-4"><BookOpenCheck className="h-5 w-5" /><span>Ask your school admin to assign you to a class or subject first.</span></div> : (
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div className="join w-full">
                <button type="button" onClick={() => setKind('HOMEWORK')} aria-pressed={kind === 'HOMEWORK'} className={`btn join-item flex-1 ${kind === 'HOMEWORK' ? 'btn-primary' : 'btn-outline'}`}><BookOpenCheck className="h-4 w-4" />Homework</button>
                <button type="button" onClick={() => setKind('MOTIVATION')} aria-pressed={kind === 'MOTIVATION'} className={`btn join-item flex-1 ${kind === 'MOTIVATION' ? 'btn-primary' : 'btn-outline'}`}><Award className="h-4 w-4" />Motivation</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control"><span className="label label-text font-medium">Class</span><select name="class_id" required value={selectedClassId} className="select select-bordered w-full" onChange={(event) => setSelectedClassId(event.target.value)}>{data.classes.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="form-control"><span className="label label-text font-medium">Section</span><select key={selectedClassId} name="section_id" required className="select select-bordered w-full"><option value="">Select assigned section</option>{data.sections.filter((item: any) => item.class_id === selectedClassId).map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
              </div>
              <label className="form-control"><span className="label label-text font-medium">{kind === 'HOMEWORK' ? 'Homework title' : 'Title'}</span><input name="title" required maxLength={120} className="input input-bordered w-full" placeholder={kind === 'HOMEWORK' ? 'e.g. Read pages 12–14' : 'e.g. A thought for today'} /></label>
              <label className="form-control"><span className="label label-text font-medium">Details</span><textarea name="body" required maxLength={5000} rows={5} className="textarea textarea-bordered w-full leading-6" placeholder={kind === 'HOMEWORK' ? 'Add instructions, materials to bring, or how to complete the task.' : 'Write an encouraging thought for students and families.'} /></label>
              {kind === 'HOMEWORK' && <label className="form-control max-w-xs"><span className="label label-text font-medium">Due date <span className="text-base-content/50">(optional)</span></span><input name="due_date" type="date" className="input input-bordered w-full" /></label>}
              <div className="card-actions justify-end border-t border-base-300 pt-4"><button type="submit" disabled={pending || !data.classes.length} className="btn btn-primary">{pending ? <span className="loading loading-spinner loading-sm" /> : <Send className="h-4 w-4" />}{pending ? 'Sharing…' : 'Share with parents'}</button></div>
            </form>
          )}
        </div>
      </section>}

      <section className="card card-border bg-base-100 shadow-sm">
        <div className="card-body p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h2 className="card-title">Recently shared</h2><p className="mt-1 text-sm text-base-content/70">Visible to linked families in the selected class.</p></div>
            {data.classes.length > 1 && <label className="form-control w-full sm:w-56"><span className="label py-1"><span className="label-text text-xs">Filter by class</span></span><select className="select select-bordered select-sm" value={filterClassId} onChange={(event) => setFilterClassId(event.target.value)}><option value="all">All assigned classes</option>{data.classes.map((item: any) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
          </div>
          <div className="mt-2 space-y-3">
            {filteredUpdates.length ? filteredUpdates.slice(0, 12).map((item: any) => (
              <details key={item.id} className="group rounded-box border border-base-300 px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-center gap-2"><span className={`badge badge-sm shrink-0 ${item.kind === 'HOMEWORK' ? 'badge-info' : 'badge-success'}`}>{item.kind === 'HOMEWORK' ? 'Homework' : 'Note'}</span><span className="truncate text-sm font-semibold">{item.title}</span></span>
                  <span className="shrink-0 text-xs text-base-content/55">{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </summary>
                <div className="mt-3 border-t border-base-200 pt-3"><p className="whitespace-pre-wrap text-sm leading-6 text-base-content/75">{item.body}</p><p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/55"><span>{className(item.class_id)} · {sectionName(item.section_id)}</span>{item.due_date && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Due {new Date(`${item.due_date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}</p></div>
              </details>
            )) : <div className="rounded-box border border-dashed border-base-300 px-5 py-10 text-center text-sm text-base-content/60">No updates for this class yet. Share homework or a class note when you’re ready.</div>}
          </div>
        </div>
      </section>
    </div>
  )
}
