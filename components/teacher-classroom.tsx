'use client'

import { BookOpen, CalendarCheck, ClipboardList, GraduationCap, Mail, MessageCircle, Phone, Users } from 'lucide-react'
import Link from 'next/link'

type Student = {
  id: string
  student_name: string
  admission_number: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_email: string | null
  class_id: string
  section_id: string
}

export function TeacherClassroom({ orgId, data }: { orgId: string; data: any }) {
  const sectionName = (id: string) => data.sections.find((item: any) => item.id === id)?.name ?? ''
  const parentContacts = (studentId: string) => {
    const ids = data.parentLinks.filter((link: any) => link.student_id === studentId).map((link: any) => link.parent_id)
    return data.parents.filter((parent: any) => ids.includes(parent.id))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-5 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <p className="text-sm font-medium text-primary">Teacher workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Welcome, {data.teacher.name.split(' ')[0]}</h1>
          <p className="mt-2 max-w-xl text-sm text-base-content/65">Your classes and students, all in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="btn btn-primary btn-sm sm:btn-md" href={`/teacher/${orgId}/attendance`}><CalendarCheck className="h-4 w-4" />Take attendance</Link>
          <Link className="btn btn-outline btn-sm sm:btn-md" href={`/teacher/${orgId}/updates`}><ClipboardList className="h-4 w-4" />Homework & notes</Link>
          <Link className="btn btn-ghost btn-sm sm:btn-md" href={`/teacher/${orgId}/communication`}><MessageCircle className="h-4 w-4" />Messages</Link>
        </div>
      </header>

      <section aria-label="Your teaching summary" className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></span>
          <div><p className="text-xl font-semibold leading-none">{data.classes.length}</p><p className="mt-1 text-sm text-base-content/60">Assigned classes</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary/10 text-secondary"><GraduationCap className="h-5 w-5" /></span>
          <div><p className="text-xl font-semibold leading-none">{data.students.length}</p><p className="mt-1 text-sm text-base-content/60">Assigned students</p></div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-lg font-semibold">My classes</h2><p className="text-sm text-base-content/60">Open a class to view its roster and family contacts.</p></div>
          <Link className="link link-primary text-sm" href={`/teacher/${orgId}/updates`}>View class homework</Link>
        </div>

        {data.classes.length ? <div className="space-y-3">{data.classes.map((schoolClass: any) => {
          const students = (data.students as Student[]).filter((student) => student.class_id === schoolClass.id)
          const sections = data.sections.filter((section: any) => section.class_id === schoolClass.id)
          const subjects = data.subjects.filter((subject: any) => subject.class_id === schoolClass.id)
          const sectionIds = new Set(sections.map((section: any) => section.id))
          const sectionStudents = students.filter((student) => sectionIds.has(student.section_id))

          return <article key={schoolClass.id} className="card card-border bg-base-100 shadow-sm">
            <div className="card-body gap-4 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-info/10 text-info"><BookOpen className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{schoolClass.name}</h3>
                    <p className="mt-1 text-sm text-base-content/60">{subjects.length ? subjects.map((subject: any) => subject.name).join(' · ') : 'Class teacher'}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sections.map((section: any) => <span key={section.id} className="badge badge-ghost badge-sm">{section.name}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="badge badge-outline gap-1.5"><Users className="h-3.5 w-3.5" />{students.length} students</span>
                  <Link className="btn btn-primary btn-sm" href={`/teacher/${orgId}/updates`}>Homework</Link>
                </div>
              </div>

              <details className="group rounded-lg border border-base-300 bg-base-200/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  <span>Class roster <span className="font-normal text-base-content/55">· {sectionStudents.length} students</span></span>
                  <span className="text-xs text-primary group-open:hidden">Show roster</span><span className="hidden text-xs text-primary group-open:inline">Hide roster</span>
                </summary>
                <div className="divide-y divide-base-300 border-t border-base-300">
                  {students.length ? students.map((student) => {
                    const parents = parentContacts(student.id)
                    return <div key={student.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0"><p className="text-sm font-medium">{student.student_name}</p><p className="mt-0.5 text-xs text-base-content/55">{sectionName(student.section_id) || 'Section not set'}{student.admission_number ? ` · ${student.admission_number}` : ''}</p></div>
                      <details className="dropdown dropdown-end self-start sm:self-auto">
                        <summary className="btn btn-ghost btn-xs gap-1.5">{parents.length || (student.guardian_phone || student.guardian_email ? 1 : 0)} family contacts <span aria-hidden="true">⌄</span></summary>
                        <div className="dropdown-content z-20 mt-2 w-72 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg">
                          {parents.length ? parents.map((parent: any) => <div key={parent.id} className="space-y-1 border-b border-base-200 py-2 last:border-0"><p className="text-sm font-medium">{parent.name || student.guardian_name || 'Parent / guardian'}</p>{parent.phone && <a className="flex items-center gap-2 text-xs text-base-content/65 hover:text-primary" href={`tel:${parent.phone}`}><Phone className="h-3.5 w-3.5" />{parent.phone}</a>}{parent.email && <a className="flex items-center gap-2 text-xs text-base-content/65 hover:text-primary" href={`mailto:${parent.email}`}><Mail className="h-3.5 w-3.5" />{parent.email}</a>}</div>) : <div className="space-y-2 py-1"><p className="text-sm font-medium">{student.guardian_name || 'Parent / guardian'}</p>{student.guardian_phone && <a className="flex items-center gap-2 text-xs text-base-content/65 hover:text-primary" href={`tel:${student.guardian_phone}`}><Phone className="h-3.5 w-3.5" />{student.guardian_phone}</a>}{student.guardian_email && <a className="flex items-center gap-2 text-xs text-base-content/65 hover:text-primary" href={`mailto:${student.guardian_email}`}><Mail className="h-3.5 w-3.5" />{student.guardian_email}</a>}</div>}
                          {parents.length === 0 && !student.guardian_phone && !student.guardian_email && <p className="text-sm text-base-content/55">No family contact details yet.</p>}
                        </div>
                      </details>
                    </div>
                  }) : <p className="px-4 py-6 text-center text-sm text-base-content/55">No students are assigned to this class yet.</p>}
                </div>
              </details>
            </div>
          </article>
        })}</div> : <div className="alert alert-info"><BookOpen className="h-5 w-5" /><span>No classes have been assigned to you yet. Ask your school admin to assign a class or subject.</span></div>}
      </section>
    </div>
  )
}
