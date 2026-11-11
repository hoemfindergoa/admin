'use client'

import { FormEvent, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpenCheck, CalendarDays, Check, MessageCircle, Quote, Send, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { sendParentMessageToTeacher } from '@/app/parent/actions'

type Student = { id: string; student_name: string; admission_number: string | null; class_id: string; section_id: string }
type ParentTab = 'homework' | 'messages' | 'notes'

export function ParentPortalWorkspace({
  orgId, orgName, logoUrl, parentName, students, classes, sections, updates, messages,
}: {
  orgId: string; orgName: string; logoUrl?: string | null; parentName: string
  students: Student[]; classes: any[]; sections: any[]; updates: any[]; messages: any[]
}) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? '')
  const [draft, setDraft] = useState('')
  const [tab, setTab] = useState<ParentTab>('homework')
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const student = students.find((item) => item.id === selectedStudentId)
  const studentUpdates = useMemo(
    () => updates.filter((item) => item.class_id === student?.class_id && (!item.section_id || item.section_id === student?.section_id)),
    [updates, student?.class_id, student?.section_id],
  )
  const homeworks = studentUpdates.filter((item: any) => item.kind === 'HOMEWORK')
  const motivation = studentUpdates.filter((item: any) => item.kind === 'MOTIVATION')
  const studentMessages = messages.filter((item: any) => item.student_id === selectedStudentId)
  const className = classes.find((item: any) => item.id === student?.class_id)?.name ?? 'Class not assigned'
  const sectionName = sections.find((item: any) => item.id === student?.section_id)?.name

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!student || !body) return
    startTransition(async () => {
      try {
        await sendParentMessageToTeacher(orgId, student.id, body)
        setDraft('')
        toast.success('Message sent to the teacher.')
        router.refresh()
      } catch (cause) {
        toast.error(cause instanceof Error ? cause.message : 'Could not send your message.')
      }
    })
  }

  const tabs: { id: ParentTab; label: string; count?: number; icon: typeof BookOpenCheck }[] = [
    { id: 'homework', label: 'Homework', count: homeworks.length, icon: BookOpenCheck },
    { id: 'messages', label: 'Messages', count: studentMessages.length, icon: MessageCircle },
    { id: 'notes', label: 'Class notes', count: motivation.length, icon: Quote },
  ]

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
      <header className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          {logoUrl ? <img src={logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl border border-base-300 bg-white object-contain p-1.5" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-5 w-5" /></span>}
          <div className="min-w-0"><p className="truncate text-sm text-base-content/60">{parentName ? `Welcome, ${parentName}` : 'Family portal'}</p><h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">{orgName}</h1></div>
        </div>
        {students.length > 1 && <label className="form-control w-full sm:w-64"><span className="label py-1"><span className="label-text text-xs font-medium">Viewing child</span></span><select className="select select-bordered select-sm w-full" value={selectedStudentId} onChange={(event) => { setSelectedStudentId(event.target.value); setTab('homework'); setDraft('') }}>{students.map((item) => <option key={item.id} value={item.id}>{item.student_name}</option>)}</select></label>}
      </header>

      {!students.length ? <div className="alert alert-info"><UserRound className="h-5 w-5" /><span>No student is linked to this parent account yet. Please contact the school office.</span></div> : <>
        <section className="flex flex-col gap-3 rounded-xl bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="avatar placeholder"><div className="w-10 rounded-full bg-primary text-primary-content"><span className="text-sm font-semibold">{student?.student_name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('')}</span></div></div><div><p className="font-semibold">{student?.student_name}</p><p className="text-sm text-base-content/65">{className}{sectionName ? ` · ${sectionName}` : ''}{student?.admission_number ? ` · ${student.admission_number}` : ''}</p></div></div>
          <div className="flex flex-wrap gap-2"><span className="badge badge-outline">{homeworks.length} homework {homeworks.length === 1 ? 'item' : 'items'}</span>{homeworks.some((item: any) => item.due_date && new Date(`${item.due_date}T23:59:59`) >= new Date()) && <span className="badge badge-warning">Due soon</span>}</div>
        </section>

        <div role="tablist" aria-label="Family portal sections" className="tabs tabs-boxed w-full gap-1 bg-base-200/70 p-1 sm:w-fit">
          {tabs.map(({ id, label, count, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`tab h-10 gap-2 px-3 ${tab === id ? 'tab-active bg-base-100 shadow-sm' : ''}`}><Icon className="h-4 w-4" /><span>{label}</span><span className="badge badge-sm border-0 bg-base-300/70">{count}</span></button>)}
        </div>

        {tab === 'homework' && <section className="card card-border bg-base-100 shadow-sm">
          <div className="card-body gap-4 p-4 sm:p-6">
            <div><h2 className="card-title text-lg">Homework</h2><p className="text-sm text-base-content/60">Classwork shared by your child’s teacher.</p></div>
            {homeworks.length ? <div className="divide-y divide-base-200">{homeworks.map((item: any) => <details key={item.id} className="group py-3 first:pt-0 last:pb-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs text-base-content/55">Shared {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
                <span className="flex shrink-0 items-center gap-2">{item.due_date ? <span className="badge badge-warning badge-sm gap-1"><CalendarDays className="h-3 w-3" />{new Date(`${item.due_date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span> : <span className="badge badge-ghost badge-sm">No due date</span>}<span className="text-xs text-primary group-open:hidden">Details</span><span className="hidden text-xs text-primary group-open:inline">Close</span></span>
              </summary>
              <div className="mt-3 rounded-lg bg-base-200/50 p-3 sm:ml-1"><p className="whitespace-pre-wrap text-sm leading-6 text-base-content/75">{item.body}</p><span className="mt-3 inline-flex items-center gap-1.5 text-xs text-success"><Check className="h-3.5 w-3.5" />Shared with this class</span></div>
            </details>)}</div> : <div className="rounded-xl border border-dashed border-base-300 px-5 py-10 text-center"><BookOpenCheck className="mx-auto h-7 w-7 text-base-content/35" /><p className="mt-2 text-sm font-medium">No homework yet</p><p className="mt-1 text-sm text-base-content/55">New assignments from the teacher will show up here.</p></div>}
          </div>
        </section>}

        {tab === 'notes' && <section className="card card-border bg-base-100 shadow-sm"><div className="card-body gap-4 p-4 sm:p-6"><div><h2 className="card-title text-lg">Class notes</h2><p className="text-sm text-base-content/60">Encouragement and reminders from the teacher.</p></div>{motivation.length ? <div className="space-y-3">{motivation.map((item: any) => <article key={item.id} className="rounded-xl bg-success/10 p-4"><div className="flex items-start gap-3"><Quote className="mt-0.5 h-4 w-4 shrink-0 text-success" /><div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-base-content/75">{item.body}</p><p className="mt-3 text-xs text-base-content/50">{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div></div></article>)}</div> : <div className="rounded-xl border border-dashed border-base-300 px-5 py-10 text-center"><Quote className="mx-auto h-7 w-7 text-base-content/35" /><p className="mt-2 text-sm font-medium">No class notes yet</p><p className="mt-1 text-sm text-base-content/55">Teacher messages for the class will appear here.</p></div>}</div></section>}

        {tab === 'messages' && <section className="card card-border bg-base-100 shadow-sm"><div className="card-body p-4 sm:p-6"><div><h2 className="card-title text-lg">Message the teacher</h2><p className="text-sm text-base-content/60">Your conversation is linked to {student?.student_name}.</p></div><div className="my-4 max-h-[55vh] min-h-56 flex-1 space-y-3 overflow-y-auto rounded-xl bg-base-200/50 p-3 sm:p-4">{studentMessages.length ? studentMessages.map((item: any) => <div key={item.id} className={`chat ${item.sender_role === 'PARENT' ? 'chat-end' : 'chat-start'}`}><div className="chat-header mb-1 text-xs">{item.sender_role === 'PARENT' ? 'You' : 'Teacher'}<time className="ml-2 opacity-50">{new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</time></div><div className={`chat-bubble text-sm ${item.sender_role === 'PARENT' ? 'chat-bubble-primary' : 'bg-base-100 text-base-content'}`}>{item.body}</div></div>) : <div className="grid h-48 place-items-center text-center"><div><MessageCircle className="mx-auto h-7 w-7 text-base-content/35" /><p className="mt-2 text-sm text-base-content/55">No messages yet. Send the teacher a note below.</p></div></div>}</div><form onSubmit={sendMessage} className="flex gap-2"><label className="sr-only" htmlFor="parent-teacher-message">Message teacher</label><input id="parent-teacher-message" className="input input-bordered min-w-0 flex-1" maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message…" /><button className="btn btn-primary" type="submit" aria-label="Send message" disabled={pending || !draft.trim()}>{pending ? <span className="loading loading-spinner loading-sm" /> : <Send className="h-4 w-4" />}</button></form></div></section>}
      </>}
    </main>
  )
}
