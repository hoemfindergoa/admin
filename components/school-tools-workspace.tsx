'use client'

import { useMemo, useState } from 'react'
import { Award, ContactIcon, CreditCard, Download, CreditCardIcon, Printer, Users } from 'lucide-react'

type Student = {
  id: string
  student_name: string
  admission_number?: string | null
  date_of_birth?: string | null
  guardian_name?: string | null
  guardian_phone?: string | null
  class_id: string
  section_id: string
  status?: string | null
}
type SchoolClass = { id: string; name: string }
type Section = { id: string; class_id: string; name: string }
type ToolId = 'id-cards' | 'certificates' | 'contact-sheet'

const toolCards = [
  // { id: 'id-cards' as const, title: 'Student ID cards', description: 'Create a clean, printable ID card with the student’s class and guardian contact.', icon: CreditCardIcon, action: 'Create ID card' },
  // { id: 'certificates' as const, title: 'Certificates', description: 'Prepare bonafide, appreciation, or leaving certificates with student details filled in.', icon: Award, action: 'Create certificate' },
  { id: 'contact-sheet' as const, title: 'Class contact sheet', description: 'Build a class-wise student and guardian list for printing or CSV export.', icon: ContactIcon, action: 'Build contact sheet' },
]

export function SchoolToolsWorkspace({
  orgName,
  logoUrl,
  students,
  classes,
  sections,
}: {
  orgName: string
  logoUrl?: string | null
  students: Student[]
  classes: SchoolClass[]
  sections: Section[]
}) {
  const [activeTool, setActiveTool] = useState<ToolId>('id-cards')
  const [studentId, setStudentId] = useState(students[0]?.id ?? '')
  const [certificateType, setCertificateType] = useState('Bonafide Certificate')
  const [certificatePurpose, setCertificatePurpose] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10))
  const [classId, setClassId] = useState('all')
  const [sectionId, setSectionId] = useState('all')

  const selectedStudent = students.find((student) => student.id === studentId)
  const selectedClass = classes.find((item) => item.id === selectedStudent?.class_id)
  const selectedSection = sections.find((item) => item.id === selectedStudent?.section_id)
  const visibleSections = sections.filter((item) => classId === 'all' || item.class_id === classId)
  const contactStudents = useMemo(() => students
    .filter((student) => classId === 'all' || student.class_id === classId)
    .filter((student) => sectionId === 'all' || student.section_id === sectionId)
    .filter((student) => student.status !== 'INACTIVE')
    .sort((a, b) => a.student_name.localeCompare(b.student_name)), [students, classId, sectionId])

  function printTool() {
    window.print()
  }

  function exportContacts() {
    const rows = [
      ['Student name', 'Admission number', 'Class', 'Section', 'Guardian', 'Guardian phone'],
      ...contactStudents.map((student) => [
        student.student_name,
        student.admission_number ?? '',
        classes.find((item) => item.id === student.class_id)?.name ?? '',
        sections.find((item) => item.id === student.section_id)?.name ?? '',
        student.guardian_name ?? '',
        student.guardian_phone ?? '',
      ]),
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-class-contacts.csv`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="space-y-7">
      <style>{`@media print {
        @page { margin: 0.45in; }
        body * { visibility: hidden !important; }
        .school-tool-print, .school-tool-print * { visibility: visible !important; }
        .school-tool-print { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; color: #111827 !important; background: white !important; }
        .school-tool-screen-only { display: none !important; }
        .school-tool-id-card { width: 3.37in !important; min-height: 2.13in !important; border: 1px solid #cbd5e1 !important; border-radius: 12px !important; box-shadow: none !important; }
        .school-tool-certificate { min-height: 9in !important; }
        .school-tool-table { width: 100% !important; border-collapse: collapse !important; }
        .school-tool-table th, .school-tool-table td { border: 1px solid #cbd5e1 !important; padding: 7px !important; text-align: left !important; }
      }`}</style>

      <header className="school-tool-screen-only flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">School workspace</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">School tools</h1>
          <p className="mt-2 max-w-2xl text-sm text-base-content/70">Create print-ready school documents and class lists from your saved student records.</p>
        </div>
        <span className="badge badge-outline gap-1.5 px-3 py-3"><Users className="h-3.5 w-3.5" /> {students.length} students</span>
      </header>

      <section className="school-tool-screen-only grid gap-4 md:grid-cols-3" aria-label="Choose a school tool">
        {toolCards.map((tool) => {
          const Icon = tool.icon
          const active = activeTool === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveTool(tool.id)}
              aria-pressed={active}
              className={`card card-border text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? 'border-primary bg-primary/5 shadow-sm' : 'bg-base-100'}`}
            >
              <div className="card-body gap-3 p-5">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}><Icon className="h-5 w-5" /></span>
                <div>
                  <h2 className="card-title text-base">{tool.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-base-content/70">{tool.description}</p>
                </div>
                <span className="mt-1 text-sm font-semibold text-primary">{tool.action} <span aria-hidden="true">→</span></span>
              </div>
            </button>
          )
        })}
      </section>

      {activeTool === 'id-cards' && (
        <section className="card card-border bg-base-100">
          <div className="card-body gap-6 p-5 sm:p-7">
            <div className="school-tool-screen-only flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-md">
                <h2 className="card-title"><CreditCardIcon className="h-5 w-5 text-primary" /> Student ID card maker</h2>
                <p className="mt-1 text-sm text-base-content/70">Choose a student, review the details, then print the card.</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <label className="form-control w-full sm:min-w-72">
                  <span className="label label-text font-medium">Student</span>
                  <select className="select select-bordered w-full" value={studentId} onChange={(event) => setStudentId(event.target.value)}>
                    {students.map((student) => <option key={student.id} value={student.id}>{student.student_name}{student.admission_number ? ` · ${student.admission_number}` : ''}</option>)}
                  </select>
                </label>
                <button type="button" onClick={printTool} disabled={!selectedStudent} className="btn btn-primary self-end"><Printer className="h-4 w-4" /> Print ID card</button>
              </div>
            </div>
            {selectedStudent ? (
              <div className="school-tool-print flex justify-center rounded-box bg-base-200/60 p-5 sm:p-8">
                <article className="school-tool-id-card w-full max-w-sm overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-lg">
                  <div className="flex items-center gap-3 bg-primary px-5 py-3 text-primary-content">
                    {logoUrl ? <img src={logoUrl} alt="" className="h-10 w-10 rounded-lg bg-white object-contain p-1" /> : <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/15"><CreditCard className="h-5 w-5" /></span>}
                    <div className="min-w-0"><p className="truncate text-sm font-bold">{orgName}</p><p className="text-[11px] opacity-80">STUDENT IDENTITY CARD</p></div>
                  </div>
                  <div className="space-y-2 p-5">
                    <h3 className="text-xl font-bold leading-tight">{selectedStudent.student_name}</h3>
                    <p className="text-sm font-medium text-base-content/70">{selectedClass?.name ?? 'Class'}{selectedSection ? ` · ${selectedSection.name}` : ''}</p>
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-base-300 pt-3 text-xs">
                      <span className="text-base-content/60">Admission no.</span><span className="font-semibold">{selectedStudent.admission_number || '—'}</span>
                      <span className="text-base-content/60">Guardian</span><span className="truncate font-semibold">{selectedStudent.guardian_name || '—'}</span>
                      <span className="text-base-content/60">Contact</span><span className="font-semibold">{selectedStudent.guardian_phone || '—'}</span>
                    </div>
                  </div>
                </article>
              </div>
            ) : <EmptyStudents />}
          </div>
        </section>
      )}

      {activeTool === 'certificates' && (
        <section className="card card-border bg-base-100">
          <div className="card-body gap-6 p-5 sm:p-7">
            <div className="school-tool-screen-only flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><h2 className="card-title"><Award className="h-5 w-5 text-primary" /> Certificate maker</h2><p className="mt-1 text-sm text-base-content/70">Fill in the details and print a school-ready certificate.</p></div>
              <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-3xl">
                <label className="form-control"><span className="label label-text font-medium">Student</span><select className="select select-bordered w-full" value={studentId} onChange={(event) => setStudentId(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>{student.student_name}</option>)}</select></label>
                <label className="form-control"><span className="label label-text font-medium">Certificate type</span><select className="select select-bordered w-full" value={certificateType} onChange={(event) => setCertificateType(event.target.value)}><option>Bonafide Certificate</option><option>Appreciation Certificate</option><option>Leaving Certificate</option></select></label>
                <label className="form-control"><span className="label label-text font-medium">Purpose / note</span><input className="input input-bordered w-full" value={certificatePurpose} onChange={(event) => setCertificatePurpose(event.target.value)} placeholder="e.g. For school admission" /></label>
                <label className="form-control"><span className="label label-text font-medium">Issue date</span><input type="date" className="input input-bordered w-full" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} /></label>
                <div className="sm:col-span-2 sm:flex sm:justify-end"><button type="button" className="btn btn-primary" onClick={printTool} disabled={!selectedStudent}><Printer className="h-4 w-4" /> Print certificate</button></div>
              </div>
            </div>
            {selectedStudent ? (
              <article className="school-tool-print school-tool-certificate mx-auto flex w-full max-w-4xl flex-col items-center justify-center border-8 border-double border-primary/40 bg-base-100 px-8 py-12 text-center sm:px-16">
                {logoUrl && <img src={logoUrl} alt="" className="mb-4 h-16 w-16 object-contain" />}
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{orgName}</p>
                <h3 className="mt-12 text-3xl font-bold">{certificateType}</h3>
                <p className="mt-10 max-w-2xl text-lg leading-9">This is to certify that <strong>{selectedStudent.student_name}</strong>{selectedStudent.admission_number ? <> (Admission No. <strong>{selectedStudent.admission_number}</strong>)</> : null} is a student of <strong>{selectedClass?.name ?? 'the school'}</strong>{selectedSection ? <> — <strong>{selectedSection.name}</strong></> : null} at {orgName}.{certificatePurpose ? <> This certificate is issued for <strong>{certificatePurpose}</strong>.</> : null}</p>
                <p className="mt-8 text-sm">Issued on {issueDate ? new Date(`${issueDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
                <div className="mt-auto grid w-full grid-cols-2 gap-12 pt-28 text-sm"><div className="border-t border-base-content/40 pt-2">Class Teacher</div><div className="border-t border-base-content/40 pt-2">Principal / Authorized Signatory</div></div>
              </article>
            ) : <EmptyStudents />}
          </div>
        </section>
      )}

      {activeTool === 'contact-sheet' && (
        <section className="card card-border bg-base-100">
          <div className="card-body gap-5 p-5 sm:p-7">
            <div className="school-tool-screen-only flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><h2 className="card-title"><ContactIcon className="h-5 w-5 text-primary" /> Class contact sheet</h2><p className="mt-1 text-sm text-base-content/70">Filter your student list, then print it or export it as CSV.</p></div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="form-control"><span className="label label-text font-medium">Class</span><select className="select select-bordered min-w-44" value={classId} onChange={(event) => { setClassId(event.target.value); setSectionId('all') }}><option value="all">All classes</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <label className="form-control"><span className="label label-text font-medium">Section</span><select className="select select-bordered min-w-36" value={sectionId} onChange={(event) => setSectionId(event.target.value)}><option value="all">All sections</option>{visibleSections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                <div className="flex items-end gap-2"><button type="button" onClick={exportContacts} disabled={!contactStudents.length} className="btn btn-outline"><Download className="h-4 w-4" /> CSV</button><button type="button" onClick={printTool} disabled={!contactStudents.length} className="btn btn-primary"><Printer className="h-4 w-4" /> Print</button></div>
              </div>
            </div>
            <div className="school-tool-print overflow-x-auto">
              <div className="mb-4"><h3 className="text-xl font-bold">{orgName} — Student Contacts</h3><p className="text-sm">{classes.find((item) => item.id === classId)?.name ?? 'All classes'}{sectionId !== 'all' ? ` · ${sections.find((item) => item.id === sectionId)?.name ?? ''}` : ''} · {contactStudents.length} students · Prepared {new Date().toLocaleDateString('en-IN')}</p></div>
              <table className="school-tool-table table table-zebra table-sm min-w-[720px]">
                <thead><tr><th>#</th><th>Student</th><th>Admission no.</th><th>Class / section</th><th>Guardian</th><th>Contact</th></tr></thead>
                <tbody>{contactStudents.map((student, index) => <tr key={student.id}><td>{index + 1}</td><td className="font-medium">{student.student_name}</td><td>{student.admission_number || '—'}</td><td>{classes.find((item) => item.id === student.class_id)?.name ?? '—'} / {sections.find((item) => item.id === student.section_id)?.name ?? '—'}</td><td>{student.guardian_name || '—'}</td><td>{student.guardian_phone || '—'}</td></tr>)}</tbody>
              </table>
              {!contactStudents.length && <p className="py-12 text-center text-sm text-base-content/60">No students match this class and section.</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function EmptyStudents() {
  return <div className="school-tool-screen-only rounded-box border border-dashed border-base-300 bg-base-200/40 px-6 py-12 text-center"><Users className="mx-auto h-8 w-8 text-base-content/40" /><p className="mt-3 font-semibold">No students available</p><p className="mt-1 text-sm text-base-content/65">Add students to this franchise to use the document tools.</p></div>
}
