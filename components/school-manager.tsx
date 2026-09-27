'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, ChevronDown, ChevronRight, Plus, School, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { addSchoolClass, addSchoolSection, addSchoolSubject, assignTeacherToClass, assignTeacherToSubject } from '@/app/dashboard/[orgId]/school/actions'

type SchoolTeacher = { id: string; name: string; email: string; phone: string | null; status: string }
type SchoolData = {
  classes: { id: string; name: string; sort_order: number }[]
  sections: { id: string; class_id: string; name: string }[]
  subjects: { id: string; class_id: string; section_id: string; name: string }[]
  teachers: SchoolTeacher[]
  classTeachers: { class_id: string; teacher_id: string }[]
  subjectTeachers: { subject_id: string; teacher_id: string }[]
}

type TeacherTarget = { kind: 'class' | 'subject'; id: string; label: string } | null
const CLASS_OPTIONS = ['Preschool', 'Day Care', 'Pre Nursery', 'Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)]
const SECTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function SchoolManager({ orgId, initialData }: { orgId: string; initialData: SchoolData }) {
  const [data, setData] = useState(initialData)
  const [selectedClassId, setSelectedClassId] = useState(initialData.classes[0]?.id ?? '')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [classSheetOpen, setClassSheetOpen] = useState(false)
  const [className, setClassName] = useState('')
  const [sectionConfirmOpen, setSectionConfirmOpen] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [teacherTarget, setTeacherTarget] = useState<TeacherTarget>(null)
  const [teacherId, setTeacherId] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  useEffect(() => setData(initialData), [initialData])

  const selectedClass = data.classes.find((item) => item.id === selectedClassId)
  const sections = useMemo(() => data.sections.filter((item) => item.class_id === selectedClassId), [data.sections, selectedClassId])
  const selectedSection = sections.find((item) => item.id === selectedSectionId) ?? sections.find((item) => item.name === selectedSectionId) ?? sections[0]
  const subjects = data.subjects.filter((item) => item.section_id === selectedSection?.id)
  const nextSection = SECTION_LETTERS.find((letter) => !sections.some((section) => section.name.trim().toUpperCase() === letter))
  const classTeacherNames = data.classTeachers.filter((assignment) => assignment.class_id === selectedClassId).map((assignment) => data.teachers.find((teacher) => teacher.id === assignment.teacher_id)).filter((teacher): teacher is SchoolTeacher => !!teacher)
  const currentTeacherAssignments = teacherTarget?.kind === 'class'
    ? data.classTeachers.filter((assignment) => assignment.class_id === teacherTarget.id).map((assignment) => assignment.teacher_id)
    : teacherTarget?.kind === 'subject'
      ? data.subjectTeachers.filter((assignment) => assignment.subject_id === teacherTarget.id).map((assignment) => assignment.teacher_id)
      : []
  const availableTeachers = data.teachers.filter((teacher) => !currentTeacherAssignments.includes(teacher.id))

  function refreshData(success: string) {
    setMessage(success)
    router.refresh()
  }

  function createClass() {
    if (!className) return
    setMessage('')
    startTransition(async () => {
      try {
        await addSchoolClass(orgId, className)
        window.location.reload()
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not add class.') }
    })
  }

  function createSection() {
    if (!selectedClass || !nextSection) return
    setSectionConfirmOpen(false)
    setMessage('')
    startTransition(async () => {
      try {
        await addSchoolSection(orgId, selectedClass.id, nextSection)
        setSelectedSectionId(nextSection)
        refreshData(`Section ${nextSection} added to ${selectedClass.name}.`)
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not add section.') }
    })
  }

  function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedClass || !selectedSection || !subjectName.trim()) return
    setMessage('')
    startTransition(async () => {
      try {
        await addSchoolSubject(orgId, selectedClass.id, selectedSection.id, subjectName.trim())
        setSubjectName('')
        refreshData('Subject added.')
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not add subject.') }
    })
  }

  function saveTeacherAssignment() {
    if (!teacherTarget || !teacherId) return
    const target = teacherTarget
    setMessage('')
    startTransition(async () => {
      try {
        if (target.kind === 'class') await assignTeacherToClass(orgId, target.id, teacherId)
        else await assignTeacherToSubject(orgId, target.id, teacherId)
        setTeacherTarget(null)
        setTeacherId('')
        refreshData('Teacher assignment saved.')
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not assign teacher.') }
    })
  }

  const assignedTeacherNames = (kind: 'class' | 'subject', targetId: string) => {
    const assignments = kind === 'class' ? data.classTeachers.filter((item) => item.class_id === targetId) : data.subjectTeachers.filter((item) => item.subject_id === targetId)
    return assignments.map((item) => data.teachers.find((teacher) => teacher.id === item.teacher_id)).filter((teacher): teacher is SchoolTeacher => !!teacher)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Manage School</h1><p className="mt-1 text-muted-foreground">Organize your classes, sections, subjects and teachers.</p></div>
        <Button variant="outline" asChild><Link href={`/dashboard/${orgId}/students`}><Users className="mr-2 h-4 w-4" />Students</Link></Button>
      </div>

      <div className="grid min-h-[560px] gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
        <Card className="flex h-fit flex-col overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="border-b px-4 py-4">
            <div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><School className="h-4 w-4 text-muted-foreground" />Classes</CardTitle><span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{data.classes.length}</span></div>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {data.classes.map((item) => {
              const isOpen = item.id === selectedClassId
              const classSections = data.sections.filter((section) => section.class_id === item.id)
              return <div key={item.id} className="space-y-0.5">
                <button onClick={() => { setSelectedClassId(item.id); setSelectedSectionId('') }} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${isOpen ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'}`}>
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="flex-1">{item.name}</span><span className="text-xs text-muted-foreground">{classSections.length}</span>
                </button>
                {isOpen && <div className="ml-4 space-y-0.5 border-l pl-3">
                  {classSections.map((section) => <button key={section.id} onClick={() => setSelectedSectionId(section.id)} className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm ${section.id === selectedSection?.id ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'}`}><span className="mr-2 text-muted-foreground/60">↳</span>Section {section.name}</button>)}
                  <button onClick={() => { setMessage(''); setSectionConfirmOpen(true) }} disabled={!nextSection || isPending} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"><Plus className="h-3.5 w-3.5" />{nextSection ? `Add Section ${nextSection}` : 'All sections added'}</button>
                </div>}
              </div>
            })}
            {!data.classes.length && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No classes yet.</p>}
          </CardContent>
          <div className="border-t p-2"><Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground" onClick={() => { setMessage(''); setClassSheetOpen(true) }}><Plus className="mr-2 h-4 w-4" />Add class</Button></div>
        </Card>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          {selectedClass ? <>
            <CardHeader className="border-b bg-muted/20 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>Classes</span><ChevronRight className="h-3 w-3" /><span>{selectedClass.name}</span>{selectedSection && <><ChevronRight className="h-3 w-3" /><span>Section {selectedSection.name}</span></>}</div><CardTitle className="mt-2 text-xl">{selectedClass.name}{selectedSection ? ` / Section ${selectedSection.name}` : ''}</CardTitle><CardDescription className="mt-1">{selectedSection ? 'Manage the subjects and teachers for this section.' : 'Choose a section from the class list to see its subjects.'}</CardDescription></div></div>
            </CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-6">
              <section className="rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-semibold">Class teachers</h3><p className="mt-1 text-xs text-muted-foreground">Teachers assigned to {selectedClass.name}.</p></div><Button size="sm" variant="outline" onClick={() => { setTeacherId(''); setTeacherTarget({ kind: 'class', id: selectedClass.id, label: `${selectedClass.name} class` }) }} disabled={!data.teachers.length}><Plus className="mr-1.5 h-4 w-4" />Assign teacher</Button></div>
                <div className="mt-3 flex flex-wrap gap-2">{classTeacherNames.length ? classTeacherNames.map((teacher) => <span key={teacher.id} className="rounded-md bg-muted px-2.5 py-1.5 text-xs">{teacher.name}</span>) : <span className="text-xs text-muted-foreground">No teacher assigned yet.</span>}{!data.teachers.length && <Link href={`/dashboard/${orgId}/staff`} className="text-xs font-medium text-primary underline-offset-4 hover:underline">Add a teacher</Link>}</div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Subjects</h3><p className="mt-1 text-xs text-muted-foreground">Add subjects and assign a teacher to each one.</p></div></div>
                {!selectedSection ? <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Add a section under {selectedClass.name} to start adding subjects.</div> : <>
                  <div className="overflow-hidden rounded-lg border">
                    {subjects.length ? <div className="divide-y">{subjects.map((subject) => {
                      const teachers = assignedTeacherNames('subject', subject.id)
                      return <div key={subject.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-sm font-medium"><BookOpen className="h-4 w-4 text-muted-foreground" />{subject.name}</div><p className="ml-6 mt-1 text-xs text-muted-foreground">{teachers.length ? teachers.map((teacher) => teacher.name).join(', ') : 'No subject teacher assigned'}</p></div><Button size="sm" variant="ghost" className="self-start text-muted-foreground sm:self-auto" onClick={() => { setTeacherId(''); setTeacherTarget({ kind: 'subject', id: subject.id, label: subject.name }) }} disabled={!data.teachers.length}><Plus className="mr-1 h-3.5 w-3.5" />Assign teacher</Button></div>
                    })}</div> : <p className="px-4 py-5 text-sm text-muted-foreground">No subjects added to Section {selectedSection.name} yet.</p>}
                  </div>
                  <form className="mt-3 flex max-w-lg gap-2" onSubmit={createSubject}><Input value={subjectName} onChange={(event) => setSubjectName(event.target.value)} placeholder="Add a subject, e.g. English" aria-label="Subject name" required /><Button type="submit" disabled={isPending || !subjectName.trim()}><Plus className="mr-1.5 h-4 w-4" />Add subject</Button></form>
                </>}
              </section>

              <div className="flex flex-col justify-between gap-3 rounded-lg bg-muted/40 p-4 sm:flex-row sm:items-center"><div><p className="text-sm font-medium">Manage students</p><p className="text-xs text-muted-foreground">Import a roster or update student class and section assignments.</p></div><Button size="sm" variant="outline" asChild><Link href={`/dashboard/${orgId}/students`}>Open Students <Users className="ml-2 h-4 w-4" /></Link></Button></div>
            </CardContent>
          </> : <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><School className="mb-3 h-8 w-8 text-muted-foreground/50" /><h2 className="font-medium">Start with a class</h2><p className="mt-1 text-sm text-muted-foreground">Add a class to manage its sections and subjects.</p></div>}
          {message && <p role="status" className={`border-t px-5 py-3 text-sm ${message.includes('added') || message.includes('saved') ? 'text-emerald-600' : 'text-destructive'}`}>{message}</p>}
        </Card>
      </div>

      <Sheet open={classSheetOpen} onOpenChange={setClassSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader><SheetTitle>Add class</SheetTitle><SheetDescription>Choose a class type to add to this school.</SheetDescription></SheetHeader>
          <div className="mt-8 space-y-5"><div className="space-y-2"><Label htmlFor="class-option">Class</Label><select id="class-option" value={className} onChange={(event) => setClassName(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select class type</option>{CLASS_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select></div>
            {message && <p className="text-sm text-destructive">{message}</p>}<Button className="w-full" onClick={createClass} disabled={isPending || !className}>Add class</Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={sectionConfirmOpen} onOpenChange={setSectionConfirmOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Add Section {nextSection}?</AlertDialogTitle><AlertDialogDescription>This will create Section {nextSection} under {selectedClass?.name}. Sections are added alphabetically.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={createSection} disabled={isPending || !nextSection}>Add Section {nextSection}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!teacherTarget} onOpenChange={(open) => { if (!open) setTeacherTarget(null) }}>
        <DialogContent><DialogHeader><DialogTitle>Assign teacher</DialogTitle><DialogDescription>Choose a teacher for {teacherTarget?.label}. The assignment will also appear in Staff / Teachers.</DialogDescription></DialogHeader>
          <div className="space-y-2 py-2"><Label htmlFor="teacher-select">Teacher</Label><div className="relative"><select id="teacher-select" value={teacherId} onChange={(event) => setTeacherId(event.target.value)} className="h-10 w-full appearance-none rounded-md border bg-background px-3 pr-9 text-sm"><option value="">Choose a teacher</option>{availableTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.email}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" /></div>{!availableTeachers.length && <p className="text-xs text-muted-foreground">All active teachers are already assigned here.</p>}</div>
          <DialogFooter><Button variant="outline" onClick={() => setTeacherTarget(null)}>Cancel</Button><Button onClick={saveTeacherAssignment} disabled={isPending || !teacherId || !availableTeachers.length}>Assign teacher</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
