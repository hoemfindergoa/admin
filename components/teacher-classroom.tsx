'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, MessageCircle, Send, School } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendParentMessage } from '@/app/teacher/[orgId]/actions'

type Student = { id: string; student_name: string; admission_number: string | null; guardian_name: string | null; guardian_phone: string | null; guardian_email: string | null; class_id: string; section_id: string }

export function TeacherClassroom({ orgId, data }: { orgId: string; data: any }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const className = (id: string) => data.classes.find((item: any) => item.id === id)?.name ?? 'Class'
  const sectionName = (id: string) => data.sections.find((item: any) => item.id === id)?.name ?? ''
  const parentFor = (studentId: string) => {
    const parentId = data.parentLinks.find((link: any) => link.student_id === studentId)?.parent_id
    return data.parents.find((parent: any) => parent.id === parentId)
  }

  function submit(student: Student) {
    setError(''); setNotice('')
    startTransition(async () => {
      try {
        await sendParentMessage(orgId, student.id, drafts[student.id] ?? '')
        setDrafts((current) => ({ ...current, [student.id]: '' }))
        setNotice(`Message sent to ${parentFor(student.id)?.name ?? 'the parent'}.`)
        router.refresh()
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not send this message.') }
    })
  }

  return <main className="min-h-screen bg-muted/30"><header className="border-b bg-background"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"><div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Teacher portal · {data.orgName}</p><h1 className="mt-1 text-xl font-semibold">Welcome, {data.teacher.name}</h1></div><span className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium">Teacher</span></div></header>
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6"><div className="grid gap-4 sm:grid-cols-3"><Card><CardContent className="flex items-center gap-3 p-4"><School className="h-5 w-5 text-muted-foreground" /><div><p className="text-xl font-semibold">{data.classes.length}</p><p className="text-xs text-muted-foreground">Assigned classes</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><GraduationCap className="h-5 w-5 text-muted-foreground" /><div><p className="text-xl font-semibold">{data.students.length}</p><p className="text-xs text-muted-foreground">Assigned students</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><BookOpen className="h-5 w-5 text-muted-foreground" /><div><p className="text-xl font-semibold">{data.subjects.length}</p><p className="text-xs text-muted-foreground">Assigned subjects</p></div></CardContent></Card></div>
      {error && <p role="alert" className="rounded-md border border-destructive/20 bg-background px-4 py-3 text-sm text-destructive">{error}</p>}{notice && <p role="status" className="rounded-md border border-emerald-200 bg-background px-4 py-3 text-sm text-emerald-700">{notice}</p>}
      {data.classes.length === 0 && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No classes have been assigned to you yet. Ask your franchise admin to assign a class or subject.</CardContent></Card>}
      <div className="grid gap-5 xl:grid-cols-2">{data.classes.map((schoolClass: any) => {
        const students = (data.students as Student[]).filter((student) => student.class_id === schoolClass.id)
        const subjects = data.subjects.filter((subject: any) => subject.class_id === schoolClass.id)
        return <Card key={schoolClass.id} className="border-border/70 shadow-sm"><CardHeader className="border-b bg-background"><CardTitle className="text-base">{schoolClass.name}</CardTitle><CardDescription>{subjects.length ? `Subjects: ${subjects.map((subject: any) => subject.name).join(', ')}` : 'Your assigned students and parent contacts'}</CardDescription></CardHeader><CardContent className="space-y-3 p-4">{students.length ? students.map((student) => {
          const parent = parentFor(student.id)
          const messages = data.messages.filter((item: any) => item.student_id === student.id)
          return <article key={student.id} className="rounded-lg border bg-background p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="font-medium">{student.student_name}</h2><p className="mt-0.5 text-xs text-muted-foreground">{schoolClass.name}{sectionName(student.section_id) ? ` · Section ${sectionName(student.section_id)}` : ''}{student.admission_number ? ` · #${student.admission_number}` : ''}</p></div>{parent && <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">Parent linked</span>}</div>
            {parent && <div className="mt-3 rounded-md bg-muted/40 p-3"><p className="text-xs font-medium">{parent.name || student.guardian_name || 'Parent'}</p><p className="mt-1 text-xs text-muted-foreground">{parent.email}{parent.phone ? ` · ${parent.phone}` : ''}</p></div>}
            {messages.length > 0 && <div className="mt-3 space-y-2 border-t pt-3">{messages.slice(-2).map((item: any) => <div key={item.id} className="text-xs"><span className="font-medium">{item.sender_role === 'TEACHER' ? 'You' : 'Parent'}: </span><span className="text-muted-foreground">{item.body}</span></div>)}</div>}
            {parent ? <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); submit(student) }}><Label className="sr-only" htmlFor={`message-${student.id}`}>Message parent</Label><Input id={`message-${student.id}`} value={drafts[student.id] ?? ''} onChange={(event) => setDrafts((current) => ({ ...current, [student.id]: event.target.value }))} placeholder="Message parent…" maxLength={2000} /><Button size="icon" aria-label="Send message to parent" disabled={pending || !(drafts[student.id] ?? '').trim()}><Send className="h-4 w-4" /></Button></form> : <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><MessageCircle className="h-3.5 w-3.5" />Parent account is not linked yet.</p>}
          </article>
        }) : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No students in this class yet.</p>}</CardContent></Card>
      })}</div>
    </div>
  </main>
}
