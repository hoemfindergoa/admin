'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, Users, Plus, Trash2, Edit2, CheckCircle2, ChevronRight, School, UserPlus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { addSchoolClass, addSchoolSection, addSchoolSubject, assignTeacherToSection, assignTeacherToSubject, deleteSchoolClass, deleteSchoolSection, deleteSchoolSubject } from '@/app/dashboard/[orgId]/school/actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

type SchoolTeacher = { id: string; name: string; email: string; phone: string | null; status: string }
type SchoolHouse = { id: string; name: string; color: string }
type SchoolData = {
  classes: { id: string; name: string; sort_order: number }[]
  sections: { id: string; class_id: string; name: string }[]
  subjects: { id: string; class_id: string; section_id: string; name: string; knowledge_type: string | null; is_compulsory: boolean }[]
  teachers: SchoolTeacher[]
  sectionTeachers: { section_id: string; teacher_id: string }[]
  subjectTeachers: { subject_id: string; teacher_id: string }[]
  houses: SchoolHouse[]
  students: {
    id: string;
    student_name: string;
    section_id: string;
    admission_number: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
    guardian_name?: string | null;
    phone?: string | null;
    status?: string;
    avatar_url?: string | null;
  }[]
}

type TeacherTarget = { kind: 'section' | 'subject'; id: string; label: string } | null
const CLASS_OPTIONS = ['Preschool', 'Day Care', 'Pre Nursery', 'Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)]
const SECTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function SchoolManager({ orgId, initialData }: { orgId: string; initialData: SchoolData }) {
  const [data, setData] = useState(initialData)
  const [selectedClassId, setSelectedClassId] = useState(initialData.classes[0]?.id ?? '')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [activeTab, setActiveTab] = useState<'subjects' | 'students'>('students')
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<SchoolData['students'][0] | null>(null)

  const [classSheetOpen, setClassSheetOpen] = useState(false)
  const [className, setClassName] = useState('')

  const [subjectSheetOpen, setSubjectSheetOpen] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [knowledgeType, setKnowledgeType] = useState('Theory')
  const [isCompulsory, setIsCompulsory] = useState('true')

  const [teacherSheetOpen, setTeacherSheetOpen] = useState(false)
  const [teacherTarget, setTeacherTarget] = useState<TeacherTarget>(null)
  const [teacherId, setTeacherId] = useState('')

  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => setData(initialData), [initialData])
  useEffect(() => {
    if (!selectedClassId && data.classes.length > 0) {
      const firstClass = data.classes[0]
      if (firstClass) setSelectedClassId(firstClass.id)
    }
  }, [data.classes, selectedClassId])

  const selectedClass = data.classes.find((item) => item.id === selectedClassId)
  const sections = useMemo(() => data.sections.filter((item) => item.class_id === selectedClassId), [data.sections, selectedClassId])

  useEffect(() => {
    const firstSection = sections[0]
    if (firstSection && !sections.find(s => s.id === selectedSectionId)) {
      setSelectedSectionId(firstSection.id)
    }
  }, [sections, selectedSectionId])

  const selectedSection = sections.find((item) => item.id === selectedSectionId) ?? sections[0]
  const subjects = data.subjects.filter((item) => item.section_id === selectedSection?.id)
  const students = data.students.filter((item) => item.section_id === selectedSection?.id)
  const nextSection = SECTION_LETTERS.find((letter) => !sections.some((section) => section.name.trim().toUpperCase() === letter))

  const sectionTeacherNames = data.sectionTeachers.filter((assignment) => assignment.section_id === selectedSectionId).map((assignment) => data.teachers.find((teacher) => teacher.id === assignment.teacher_id)).filter((teacher): teacher is SchoolTeacher => !!teacher)

  const currentTeacherAssignments = teacherTarget?.kind === 'section'
    ? data.sectionTeachers.filter((assignment) => assignment.section_id === teacherTarget.id).map((assignment) => assignment.teacher_id)
    : teacherTarget?.kind === 'subject'
      ? data.subjectTeachers.filter((assignment) => assignment.subject_id === teacherTarget.id).map((assignment) => assignment.teacher_id)
      : []
  const availableTeachers = data.teachers.filter((teacher) => !currentTeacherAssignments.includes(teacher.id))

  function refreshData(success: string) {
    toast.success(success)
    router.refresh()
  }

  function createClass() {
    if (!className) return
    startTransition(async () => {
      try {
        await addSchoolClass(orgId, className)
        setClassSheetOpen(false)
        window.location.reload()
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not add class.') }
    })
  }

  function createSection() {
    if (!selectedClass || !nextSection) return
    startTransition(async () => {
      try {
        await addSchoolSection(orgId, selectedClass.id, nextSection)
        refreshData(`Section ${nextSection} added to ${selectedClass.name}.`)
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not add section.') }
    })
  }

  function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedClass || !selectedSection || !subjectName.trim()) return
    startTransition(async () => {
      try {
        await addSchoolSubject(orgId, selectedClass.id, selectedSection.id, subjectName.trim(), knowledgeType, isCompulsory === 'true')
        setSubjectSheetOpen(false)
        setSubjectName('')
        refreshData('Subject added.')
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not add subject.') }
    })
  }

  function assignTeacher() {
    if (!teacherTarget || !teacherId) return
    startTransition(async () => {
      try {
        if (teacherTarget.kind === 'section') {
          await assignTeacherToSection(orgId, teacherTarget.id, teacherId)
        } else {
          await assignTeacherToSubject(orgId, teacherTarget.id, teacherId)
        }
        setTeacherSheetOpen(false)
        refreshData('Teacher assigned.')
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not assign teacher.') }
    })
  }

  function handleDeleteClass(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete class ${name}? This will remove all sections, subjects, and assignments.`)) return
    startTransition(async () => {
      try {
        await deleteSchoolClass(orgId, id)
        if (selectedClassId === id) setSelectedClassId('')
        refreshData(`Class ${name} deleted.`)
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not delete class.') }
    })
  }

  function handleDeleteSection(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete section ${name}? This will remove all subjects and assignments.`)) return
    startTransition(async () => {
      try {
        await deleteSchoolSection(orgId, id)
        if (selectedSectionId === id) setSelectedSectionId('')
        refreshData(`Section ${name} deleted.`)
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not delete section.') }
    })
  }

  function handleDeleteSubject(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete subject ${name}? This will remove all assignments.`)) return
    startTransition(async () => {
      try {
        await deleteSchoolSubject(orgId, id)
        refreshData(`Subject ${name} deleted.`)
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not delete subject.') }
    })
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden border rounded-xl bg-white shadow-sm">
      {/* LEFT SIDEBAR - CLASSES */}
      <div className="w-[280px] border-r flex flex-col bg-zinc-50/50 shrink-0">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
            <School className="w-4 h-4 text-indigo-500" /> Classes
          </h2>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setClassSheetOpen(true)}>
            <Plus className="w-4 h-4 text-zinc-600" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {data.classes.map((cls) => (
            <div key={cls.id}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedClassId(cls.id)}
                  className={cn(
                    "flex-1 flex items-center justify-between px-3 py-2 text-sm rounded-lg font-medium transition-colors",
                    selectedClassId === cls.id ? "bg-indigo-50 text-indigo-700" : "text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  <span>{cls.name}</span>
                  <ChevronRight className={cn("w-4 h-4 transition-transform", selectedClassId === cls.id ? "rotate-90 text-indigo-500" : "opacity-0")} />
                </button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={() => handleDeleteClass(cls.id, cls.name)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* SECTIONS UNDER CLASS */}
              {selectedClassId === cls.id && (
                <div className="pl-4 mt-1 space-y-1 border-l-2 border-indigo-100 ml-3 py-1">
                  {sections.map((section) => (
                    <div key={section.id} className="flex items-center gap-1 pr-1">
                      <button
                        onClick={() => setSelectedSectionId(section.id)}
                        className={cn(
                          "flex-1 flex items-center gap-2 px-3 py-1.5 text-sm rounded-md font-medium transition-colors",
                          selectedSectionId === section.id ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/60" : "text-zinc-500 hover:text-zinc-900"
                        )}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full", selectedSectionId === section.id ? "bg-indigo-500" : "bg-zinc-300")} />
                        Section {section.name}
                      </button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={() => handleDeleteSection(section.id, section.name)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {nextSection && (
                    <button
                      onClick={createSection}
                      disabled={isPending}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md font-medium text-indigo-600 hover:bg-indigo-50/50"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Section {nextSection}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {data.classes.length === 0 && (
            <div className="p-4 text-center text-sm text-zinc-500 border border-dashed rounded-lg">
              No classes added.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {selectedClass && selectedSection ? (
          <>
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                  {selectedClass.name} <span className="text-zinc-400 font-medium">/</span> Section {selectedSection.name}
                </h1>
                <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {students.length} Students
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> {subjects.length} Subjects
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="shadow-sm border-zinc-200" onClick={() => {
                  setTeacherTarget({ kind: 'section', id: selectedSection.id, label: `Section ${selectedSection.name}` })
                  setTeacherSheetOpen(true)
                }}>
                  <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" /> Class Teachers
                </Button>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                  <Link href={`/dashboard/${orgId}/students?class=${selectedClass.id}&section=${selectedSection.id}`}>
                    Manage Students
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {sectionTeacherNames.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {sectionTeacherNames.map(t => (
                    <div key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                      Class Teacher: {t.name}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mb-6 bg-zinc-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveTab('students')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'students' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  <Users className="w-4 h-4" /> Students
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    activeTab === 'subjects' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  )}
                >
                  <BookOpen className="w-4 h-4" /> Subjects
                </button>
              </div>

              <div>
                {activeTab === 'subjects' && (
                  <Card className="shadow-sm border-zinc-200 overflow-hidden">
                    <CardHeader className="border-b bg-zinc-50/80 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-900">
                            <div className="p-1.5 bg-blue-100 rounded-md">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            Subjects
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">Manage subjects for this section</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => setSubjectSheetOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-8">
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-zinc-100">
                        {subjects.length > 0 ? subjects.map((subject) => {
                          const assignedTeachers = data.subjectTeachers.filter(t => t.subject_id === subject.id).map(t => data.teachers.find(teacher => teacher.id === t.teacher_id)).filter((t): t is SchoolTeacher => !!t)
                          return (
                            <div key={subject.id} className="p-5 flex items-start justify-between group hover:bg-zinc-50/50 transition-all">
                              <div>
                                <div className="font-medium text-sm text-zinc-900 flex items-center gap-2">
                                  {subject.name}
                                  {!subject.is_compulsory && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">Optional</span>}
                                </div>
                                <div className="text-xs text-zinc-500 mt-1.5 flex items-center gap-3">
                                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {subject.knowledge_type || 'Theory'}</span>
                                  {assignedTeachers.length > 0 ? (
                                    <span className="text-indigo-600 font-medium flex items-center gap-1 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                                      <GraduationCap className="w-3.5 h-3.5" /> {assignedTeachers.map(t => t.name).join(', ')}
                                    </span>
                                  ) : (
                                    <span className="text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded-md">No teacher</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => {
                                  setTeacherTarget({ kind: 'subject', id: subject.id, label: subject.name })
                                  setTeacherSheetOpen(true)
                                }}>
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteSubject(subject.id, subject.name)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        }) : (
                          <div className="py-12 text-center flex flex-col items-center justify-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                              <BookOpen className="w-6 h-6 text-blue-300" />
                            </div>
                            <p className="text-sm font-medium text-zinc-900">No subjects added</p>
                            <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Add subjects to start managing the curriculum.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'students' && (
                  <Card className="shadow-sm border-zinc-200 overflow-hidden">
                    <CardHeader className="border-b bg-zinc-50/80 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-900">
                            <div className="p-1.5 bg-fuchsia-100 rounded-md">
                              <Users className="w-4 h-4 text-fuchsia-600" />
                            </div>
                            Students
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">Students enrolled in this section</CardDescription>
                        </div>
                        <Button size="sm" asChild className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-sm h-8">
                          <Link href={`/dashboard/${orgId}/students?class=${selectedClass.id}&section=${selectedSection.id}&add=true`}>
                            <Plus className="w-4 h-4 mr-1" /> Add
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 bg-zinc-50/30">
                      {students.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {students.slice(0, 50).map((student) => (
                            <div
                              key={student.id}
                              onClick={() => setSelectedStudentForModal(student)}
                              className="group flex flex-col items-center justify-center text-center gap-3 p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-fuchsia-200 transition-all cursor-pointer h-full"
                            >
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-100 to-indigo-100 border-2 border-fuchsia-200 flex items-center justify-center shrink-0 mb-1 group-hover:scale-105 transition-transform overflow-hidden relative">
                                {student.avatar_url ? (
                                  <img src={student.avatar_url} alt={student.student_name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xl font-bold text-fuchsia-700">{student.student_name.charAt(0).toUpperCase()}</span>
                                )}
                              </div>
                              <div className="flex-1 w-full flex flex-col items-center min-w-0 space-y-1">
                                <div className="font-semibold text-sm text-zinc-900 truncate w-full">{student.student_name}</div>
                                <div className="text-xs text-zinc-500 truncate max-w-full bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                                  {student.admission_number ? `#${student.admission_number}` : 'No ID'}
                                </div>
                                {(student.guardian_name || student.phone) && (
                                  <div className="text-[10px] text-zinc-400 mt-2 line-clamp-1">
                                    {student.guardian_name && <span>{student.guardian_name} </span>}
                                    {student.phone && <span>({student.phone})</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center flex flex-col items-center justify-center bg-white border border-dashed border-zinc-200 rounded-xl">
                          <div className="w-12 h-12 bg-fuchsia-50 rounded-full flex items-center justify-center mb-3">
                            <Users className="w-6 h-6 text-fuchsia-300" />
                          </div>
                          <p className="text-sm font-medium text-zinc-900">No students found</p>
                          <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Add students to see them listed here.</p>
                        </div>
                      )}
                      {students.length > 50 && (
                        <div className="mt-4 text-center">
                          <Button variant="outline" size="sm" asChild className="w-full text-zinc-600 shadow-sm">
                            <Link href={`/dashboard/${orgId}/students?class=${selectedClass.id}&section=${selectedSection.id}`}>
                              View all {students.length} students
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <School className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900">Select a Class and Section</h2>
            <p className="text-zinc-500 mt-2 max-w-md">Choose a class from the left sidebar to manage its sections, subjects, students, and teachers.</p>
          </div>
        )}
      </div>

      {/* ADD CLASS SHEET */}
      <Sheet open={classSheetOpen} onOpenChange={setClassSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add a Class</SheetTitle>
            <SheetDescription>Select a class level to add to this franchise.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Class Name</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              >
                <option value="">Select a class</option>
                {CLASS_OPTIONS.filter(opt => !data.classes.some(c => c.name === opt)).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <Button className="w-full" onClick={createClass} disabled={isPending || !className}>
              Add Class
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ADD SUBJECT SHEET */}
      <Sheet open={subjectSheetOpen} onOpenChange={setSubjectSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Subject to {selectedSection?.name}</SheetTitle>
            <SheetDescription>Create a new subject for this section.</SheetDescription>
          </SheetHeader>
          <form className="mt-6 space-y-6" onSubmit={createSubject}>
            <div className="space-y-2">
              <Label htmlFor="subject-name">Subject Name</Label>
              <Input id="subject-name" required value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="knowledge-type">Knowledge Type</Label>
              <Input id="knowledge-type" required value={knowledgeType} onChange={(e) => setKnowledgeType(e.target.value)} placeholder="e.g. Theory, Practical" />
            </div>
            <div className="space-y-3">
              <Label>Subject Type</Label>
              <RadioGroup value={isCompulsory} onValueChange={setIsCompulsory} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-200">
                  <RadioGroupItem value="true" id="compulsory" />
                  <Label htmlFor="compulsory" className="flex-1 cursor-pointer">Compulsory Subject</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-200">
                  <RadioGroupItem value="false" id="additional" />
                  <Label htmlFor="additional" className="flex-1 cursor-pointer">Additional / Optional Subject</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={isPending || !subjectName.trim()}>
              Save Subject
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* ASSIGN TEACHER SHEET */}
      <Sheet open={teacherSheetOpen} onOpenChange={setTeacherSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Assign Teacher to {teacherTarget?.label}</SheetTitle>
            <SheetDescription>Select a teacher from the school staff.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {availableTeachers.length > 0 ? (
              <div className="space-y-2">
                <Label>Select Teacher</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">Select a teacher...</option>
                  {availableTeachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
                <Button className="w-full mt-4" onClick={assignTeacher} disabled={isPending || !teacherId}>
                  Assign Teacher
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-md text-sm text-center">
                <p>No available teachers to assign.</p>
                <Button variant="link" className="mt-2" asChild>
                  <Link href={`/dashboard/${orgId}/staff`}>Invite more staff</Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      {/* STUDENT DETAILS MODAL */}
      <Dialog open={!!selectedStudentForModal} onOpenChange={(open) => !open && setSelectedStudentForModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedStudentForModal && (
            <>
              <DialogHeader>
                <DialogTitle>Student Information</DialogTitle>
                <DialogDescription>Details for {selectedStudentForModal.student_name}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-100 to-indigo-100 border-4 border-white shadow-md flex items-center justify-center shrink-0 overflow-hidden relative">
                  {selectedStudentForModal.avatar_url ? (
                    <img src={selectedStudentForModal.avatar_url} alt={selectedStudentForModal.student_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-fuchsia-700">{selectedStudentForModal.student_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-zinc-900">{selectedStudentForModal.student_name}</h3>
                  <div className="text-sm font-medium text-indigo-600 mt-1 flex items-center justify-center gap-2">
                    <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Class: {selectedClass?.name}</span>
                    <span className="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Section: {selectedSection?.name}</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Admission No</p>
                    <p className="text-sm font-medium text-zinc-900">{selectedStudentForModal.admission_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Status</p>
                    <p className="text-sm font-medium text-zinc-900">
                      <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium", selectedStudentForModal.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                        {selectedStudentForModal.status || 'ACTIVE'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Gender</p>
                    <p className="text-sm font-medium text-zinc-900 capitalize">{selectedStudentForModal.gender?.toLowerCase() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Date of Birth</p>
                    <p className="text-sm font-medium text-zinc-900">{selectedStudentForModal.date_of_birth || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Guardian</p>
                    <p className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                      {selectedStudentForModal.guardian_name || 'N/A'}
                      {selectedStudentForModal.phone && <span className="text-zinc-500 font-normal">({selectedStudentForModal.phone})</span>}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedStudentForModal(null)}>Close</Button>
                <Button asChild className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
                  <Link href={`/dashboard/${orgId}/students/${selectedStudentForModal.id}`}>
                    Full Profile & Edit
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
