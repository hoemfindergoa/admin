'use client'

import { FormEvent, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, School, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createSchoolTeacher } from '@/app/dashboard/[orgId]/school/actions'

type Teacher = { id: string; name: string; email: string; phone: string | null; status: string }

export function StaffTeachersWorkspace({ orgId, data }: { orgId: string; data: any }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      try {
        await createSchoolTeacher(orgId, formData)
        form.reset()
        setOpen(false)
        router.refresh()
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not add the teacher.') }
    })
  }

  const teacherClassNames = (teacherId: string) => data.classTeachers.filter((item: any) => item.teacher_id === teacherId).map((item: any) => data.classes.find((schoolClass: any) => schoolClass.id === item.class_id)?.name).filter(Boolean)
  const teacherSubjects = (teacherId: string) => data.subjectTeachers.filter((item: any) => item.teacher_id === teacherId).map((item: any) => {
    const subject = data.subjects.find((candidate: any) => candidate.id === item.subject_id)
    if (!subject) return null
    const schoolClass = data.classes.find((candidate: any) => candidate.id === subject.class_id)
    const section = data.sections.find((candidate: any) => candidate.id === subject.section_id)
    return `${subject.name} · ${schoolClass?.name ?? 'Class'}${section?.name ? ` / ${section.name}` : ''}`
  }).filter(Boolean)

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Staff &amp; Teachers</h1><p className="mt-1 text-muted-foreground">Teachers have a separate sign-in and only see their assigned classes and students.</p></div><Button onClick={() => { setError(''); setOpen(true) }}><UserPlus className="mr-2 h-4 w-4" />Add teacher</Button></div>
    {!data.teachers.length ? <Card><CardContent className="flex flex-col items-center p-10 text-center"><Users className="mb-3 h-8 w-8 text-muted-foreground/50" /><p className="font-medium">No teachers added yet</p><p className="mt-1 max-w-md text-sm text-muted-foreground">Add teachers here. Their invitation gives them a separate teacher account; regular admin users are not included in this list.</p><Button className="mt-4" size="sm" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" />Add your first teacher</Button></CardContent></Card> : <Card className="border-border/70 shadow-sm"><CardHeader className="border-b"><CardTitle>Teachers</CardTitle><CardDescription>{data.teachers.length} teachers for this franchise</CardDescription></CardHeader><CardContent className="p-0"><div className="overflow-auto"><table className="w-full text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-4 text-left font-medium">Teacher</th><th className="p-4 text-left font-medium">Classes</th><th className="p-4 text-left font-medium">Subjects</th><th className="p-4 text-left font-medium">Status</th><th className="p-4 text-right"></th></tr></thead><tbody>{data.teachers.map((teacher: Teacher) => { const classes = teacherClassNames(teacher.id); const subjects = teacherSubjects(teacher.id); return <tr key={teacher.id} className="border-t"><td className="p-4"><p className="font-medium">{teacher.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{teacher.email}{teacher.phone ? ` · ${teacher.phone}` : ''}</p></td><td className="p-4"><div className="flex flex-wrap gap-1">{classes.length ? classes.map((name: string) => <span key={name} className="rounded bg-muted px-2 py-1 text-xs">{name}</span>) : <span className="text-xs text-muted-foreground">Not assigned</span>}</div></td><td className="p-4"><div className="flex flex-wrap gap-1">{subjects.length ? subjects.map((label: string) => <span key={label} className="rounded bg-muted px-2 py-1 text-xs">{label}</span>) : <span className="text-xs text-muted-foreground">Not assigned</span>}</div></td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${teacher.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{teacher.status === 'ACTIVE' ? 'Active' : 'Invitation pending'}</span></td><td className="p-4 text-right"><Button size="sm" variant="ghost" asChild><Link href={`/dashboard/${orgId}/school`}><School className="mr-1.5 h-4 w-4" />Assign</Link></Button></td></tr> })}</tbody></table></div></CardContent></Card>}

    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md"><SheetHeader><SheetTitle>Add teacher</SheetTitle><SheetDescription>Add a separate teacher profile and send a sign-in invitation. Teachers only see assigned classes, students and parent conversations.</SheetDescription></SheetHeader>
      <form onSubmit={submit} className="mt-8 space-y-5"><div className="space-y-2"><Label htmlFor="teacher-name">Full name</Label><Input id="teacher-name" name="name" autoComplete="name" required maxLength={120} placeholder="Teacher name" disabled={pending} /></div><div className="space-y-2"><Label htmlFor="teacher-email">Email address</Label><Input id="teacher-email" name="email" type="email" autoComplete="email" required placeholder="teacher@example.com" disabled={pending} /><p className="text-xs text-muted-foreground">The invitation is sent to this address.</p></div><div className="space-y-2"><Label htmlFor="teacher-phone">Phone number</Label><Input id="teacher-phone" name="phone" type="tel" autoComplete="tel" placeholder="Optional" disabled={pending} /></div>
        {error && <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
        <SheetFooter className="border-t pt-4"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button><Button type="submit" disabled={pending}>{pending ? 'Sending invitation…' : 'Create teacher & invite'}</Button></SheetFooter>
      </form>
    </SheetContent></Sheet>
  </div>
}
