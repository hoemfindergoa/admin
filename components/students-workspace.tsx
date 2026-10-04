'use client'

import { ChangeEvent, useEffect, useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, FileSpreadsheet, GraduationCap, Pencil, Plus, Upload, Search, Filter, Home, User, FileText, Calendar, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { assignStudent, importStudents } from '@/app/dashboard/[orgId]/students/actions'
import { StudentEditorSheet } from '@/components/student-editor-sheet'

type SchoolClass = { id: string; name: string }
type Section = { id: string; class_id: string; name: string }
type Student = { id: string; student_name: string; admission_number: string | null; date_of_birth: string | null; gender: string | null; guardian_name: string | null; guardian_phone: string | null; guardian_email: string | null; class_id: string; section_id: string; status: string; updated_at: string; updated_by_email: string | null;[key: string]: unknown }
type StudentRow = { student_name: string; admission_number?: string; date_of_birth?: string; gender?: string; guardian_name?: string; guardian_phone?: string; guardian_email?: string; class: string; section: string;[key: string]: string | undefined }
type StudentDetail = { student_id: string; house_id: string | null; active_fee: number | null; optional_subjects: string[]; details: Record<string, string | null>; siblings: Array<{ name: string; class: string }>; concessions: Array<{ name: string; amount: string; note: string }>; profile_picture_path: string | null; profile_picture_url?: string | null; updated_at: string; updated_by_email: string | null }

function parseCsv(source: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], value = '', quoted = false
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { value += '"'; i++ }
      else if (char === '"') quoted = false
      else value += char
    } else if (char === '"') quoted = true
    else if (char === ',') { row.push(value); value = '' }
    else if (char === '\n') { row.push(value.replace(/\r$/, '')); rows.push(row); row = []; value = '' }
    else value += char
  }
  if (value || row.length) { row.push(value.replace(/\r$/, '')); rows.push(row) }
  return rows.filter((item) => item.some((cell) => cell.trim()))
}

async function unzipText(bytes: Uint8Array, targetName: string): Promise<string | null> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65558); i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  if (eocd < 0) throw new Error('This is not a valid .xlsx workbook.')
  const count = view.getUint16(eocd + 10, true)
  let cursor = view.getUint32(eocd + 16, true)
  const decoder = new TextDecoder()
  for (let i = 0; i < count; i++) {
    if (view.getUint32(cursor, true) !== 0x02014b50) break
    const method = view.getUint16(cursor + 10, true), compressedSize = view.getUint32(cursor + 20, true)
    const nameLength = view.getUint16(cursor + 28, true), extraLength = view.getUint16(cursor + 30, true), commentLength = view.getUint16(cursor + 32, true)
    const name = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + nameLength))
    const localOffset = view.getUint32(cursor + 42, true)
    if (name === targetName) {
      const localNameLength = view.getUint16(localOffset + 26, true), localExtraLength = view.getUint16(localOffset + 28, true)
      const start = localOffset + 30 + localNameLength + localExtraLength
      const compressed = bytes.slice(start, start + compressedSize)
      if (method === 0) return decoder.decode(compressed)
      if (method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('Your browser cannot read compressed Excel workbooks. Please save as .csv and upload again.')
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw' as CompressionFormat))
      return await new Response(stream).text()
    }
    cursor += 46 + nameLength + extraLength + commentLength
  }
  return null
}

function columnIndex(reference: string) { return [...reference.match(/[A-Z]+/i)![0].toUpperCase()].reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1 }

async function parseXlsx(file: File): Promise<string[][]> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const [sheetXml, sharedXml] = await Promise.all([unzipText(bytes, 'xl/worksheets/sheet1.xml'), unzipText(bytes, 'xl/sharedStrings.xml')])
  if (!sheetXml) throw new Error('Could not find the first worksheet in this Excel file.')
  const parser = new DOMParser()
  const shared = sharedXml ? Array.from(parser.parseFromString(sharedXml, 'application/xml').getElementsByTagName('si')).map((si) => Array.from(si.getElementsByTagName('t')).map((t) => t.textContent ?? '').join('')) : []
  const xml = parser.parseFromString(sheetXml, 'application/xml')
  return Array.from(xml.getElementsByTagName('row')).map((row) => {
    const cells: string[] = []
    for (const cell of Array.from(row.getElementsByTagName('c'))) {
      const index = columnIndex(cell.getAttribute('r') ?? 'A1')
      const type = cell.getAttribute('t')
      const value = type === 'inlineStr' ? Array.from(cell.getElementsByTagName('t')).map((t) => t.textContent ?? '').join('') : cell.getElementsByTagName('v')[0]?.textContent ?? ''
      cells[index] = type === 's' ? shared[Number(value)] ?? '' : value
    }
    return cells.map((cell) => cell ?? '')
  }).filter((row) => row.some((cell) => cell.trim()))
}

function toRecords(matrix: string[][]): StudentRow[] {
  if (matrix.length < 2) throw new Error('The spreadsheet needs a header row and at least one student row.')
  const normalize = (value: string) => value.trim().toLowerCase().replace(/[\s-]+/g, '_')
  const headerRow = matrix[0]?.map(normalize)
  const aliases: Record<string, string> = { name: 'student_name', student: 'student_name', class_name: 'class', classroom: 'class', section_name: 'section', dob: 'date_of_birth', student_phone: 'phone', parent_name: 'guardian_name', parent_phone: 'guardian_phone', parent_email: 'guardian_email', siblings_json: 'siblings', concessions_json: 'concessions' }
  const positions = new Map(headerRow?.map((header, index) => [aliases[header] ?? header, index]))
  const missing = ['student_name', 'class', 'section'].filter((field) => !positions.has(field))
  if (missing.length) throw new Error(`Missing required column(s): ${missing.join(', ')}.`)
  return matrix.slice(1).map((cells) => {
    const get = (header: string) => cells[positions.get(header) ?? -1]?.trim() ?? ''
    let dob = get('date_of_birth')
    if (/^\d+(\.\d+)?$/.test(dob) && Number(dob) > 1000) {
      const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(dob) * 86400000))
      dob = date.toISOString().slice(0, 10)
    }
    return Object.fromEntries([...positions.keys()].map((header) => [header, header === 'date_of_birth' ? dob : get(header)])) as StudentRow
  }).filter((row) => Object.values(row).some(Boolean))
}

export function StudentsWorkspace({ orgId, students: initialStudents, classes, sections, details, houses, subjects }: { orgId: string; students: Student[]; classes: SchoolClass[]; sections: Section[]; details: StudentDetail[]; houses: Array<{ id: string; name: string }>; subjects: Array<{ id: string; name: string; class_id: string; section_id: string }> }) {
  const [students, setStudents] = useState(initialStudents)
  const [rows, setRows] = useState<StudentRow[]>([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [viewing, setViewing] = useState<Student | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [hostlerFilter, setHostlerFilter] = useState('all')
  const [assignments, setAssignments] = useState<Record<string, { classId: string; sectionId: string }>>({})
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const sectionsByClass = useMemo(() => sections.reduce<Record<string, Section[]>>((memo, item) => { (memo[item.class_id] ??= []).push(item); return memo }, {}), [sections])
  useEffect(() => setStudents(initialStudents), [initialStudents])

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setError(''); setNotice(''); setRows([]); setFileName('')
    if (!file) return
    try {
      const matrix = file.name.toLowerCase().endsWith('.csv') ? parseCsv(await file.text()) : await parseXlsx(file)
      const parsed = toRecords(matrix)
      if (parsed.length > 500) throw new Error('Import up to 500 students per upload.')
      setRows(parsed); setFileName(file.name)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not read this file.') }
  }

  function doImport() {
    setError(''); setNotice('')
    startTransition(async () => {
      try { const result = await importStudents(orgId, rows); setNotice(`${result.imported} students imported. ${result.parentsCreated} parent accounts linked or invited.`); setError(result.parentWarnings.join('\n')); setRows([]); setFileName(''); router.refresh() }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Import failed.') }
    })
  }

  function saveAssignment(student: Student) {
    const assignment = assignments[student.id] ?? { classId: student.class_id, sectionId: student.section_id }
    setError(''); setNotice('')
    startTransition(async () => {
      try { await assignStudent(orgId, student.id, assignment.classId, assignment.sectionId); setStudents((current) => current.map((item) => item.id === student.id ? { ...item, class_id: assignment.classId, section_id: assignment.sectionId } : item)); setNotice(`Updated ${student.student_name}'s class and section.`); router.refresh() }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update student.') }
    })
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight">Students</h1><p className="mt-1 text-muted-foreground">Create and update student records, families, and class assignments.</p></div><div className="flex gap-2"><Button variant="outline" asChild><Link href={`/dashboard/${orgId}/school`}>Manage classes and sections</Link></Button><details className="relative"><summary className="flex h-10 cursor-pointer list-none items-center rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 text-sm font-semibold text-white"><Plus className="mr-2 h-4 w-4" />Add student</summary><div className="absolute right-0 z-20 mt-2 w-52 rounded-md border bg-popover p-1 shadow-lg"><button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => { setEditing(null); setEditorOpen(true) }}>Add single student</button><button className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent" onClick={() => setBulkOpen((value) => !value)}>Bulk upload</button></div></details></div></div>
    {bulkOpen && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Bulk upload students</CardTitle><CardDescription>Upload an Excel workbook (.xlsx) or CSV with class and section names that already exist in Manage School. Add profile pictures after import by editing the student.</CardDescription></CardHeader><CardContent className="space-y-4">
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><a href="/student-import-template.csv" download><Download className="mr-2 h-4 w-4" />Download template</a></Button><span className="self-center text-xs text-muted-foreground">Up to 500 students · siblings and concessions columns use JSON lists</span></div>
      <div className="space-y-2"><Label htmlFor="student-file">Excel or CSV file</Label><Input id="student-file" type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFile} /></div>
      {fileName && <p className="flex items-center gap-2 text-sm text-muted-foreground"><FileSpreadsheet className="h-4 w-4" />{fileName} · {rows.length} students ready</p>}
      {rows.length > 0 && <><div className="max-h-52 overflow-auto rounded-md border"><table className="w-full text-xs"><thead className="bg-muted"><tr>{['Student', 'Class', 'Section'].map((header) => <th key={header} className="p-2 text-left">{header}</th>)}</tr></thead><tbody>{rows.slice(0, 8).map((row, i) => <tr key={i} className="border-t"><td className="p-2">{row.student_name || <span className="text-destructive">Missing name</span>}</td><td className="p-2">{row.class}</td><td className="p-2">{row.section}</td></tr>)}</tbody></table></div><Button onClick={doImport} disabled={isPending || classes.length === 0 || sections.length === 0}>{isPending ? 'Importing…' : `Import ${rows.length} students`}</Button></>}
      {classes.length === 0 && <p className="text-sm text-amber-700">Add classes and sections before importing students.</p>}
    </CardContent></Card>}
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-indigo-600" />School roster</CardTitle>
            <CardDescription>{students.length} students · click on a student to view their full profile.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input placeholder="Search students..." className="pl-9 bg-zinc-50 border-zinc-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium shadow-sm min-w-32" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium shadow-sm" value={hostlerFilter} onChange={e => setHostlerFilter(e.target.value)}>
              <option value="all">Any Status</option>
              <option value="hostler">Hostlers Only</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
      {!students.length ? <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No students yet. Choose Add student to create one or upload a roster.</div> : <div className="max-h-[600px] overflow-auto rounded-xl border border-zinc-200 shadow-sm"><table className="w-full text-sm"><thead className="sticky top-0 bg-zinc-100/80 backdrop-blur-sm shadow-sm z-10"><tr><th className="p-4 text-left font-semibold text-zinc-700">Student</th><th className="p-4 text-left font-semibold text-zinc-700">Admission no.</th><th className="p-4 text-left font-semibold text-zinc-700">Class / section</th><th className="p-4"></th><th className="p-4"></th></tr></thead><tbody className="divide-y divide-zinc-100 bg-white">{
        students.filter(student => {
          if (classFilter !== 'all' && student.class_id !== classFilter) return false;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = student.student_name?.toLowerCase().includes(query);
            const matchesId = student.admission_number?.toLowerCase().includes(query);
            if (!matchesName && !matchesId) return false;
          }
          if (hostlerFilter === 'hostler') {
            const detail = details.find(d => d.student_id === student.id);
            if (detail?.details?.is_hostler !== 'Yes') return false;
          }
          return true;
        }).map((student) => { 
        const value = assignments[student.id] ?? { classId: student.class_id, sectionId: student.section_id }; 
        const choices = sectionsByClass[value.classId] ?? []; 
        const detail = details.find((item) => item.student_id === student.id); 
        const updatedAt = [student.updated_at, detail?.updated_at].filter(Boolean).reduce((latest: string | undefined, value: string | undefined) => value && (!latest || value > latest) ? value : latest, ''); 
        const updatedBy = updatedAt === detail?.updated_at ? detail?.updated_by_email : student.updated_by_email; 
        return <tr key={student.id} className="group hover:bg-indigo-50/40 transition-colors cursor-pointer" onClick={() => setViewing(student)}>
          <td className="p-4 font-medium">
            <div className="flex items-center gap-3">
              {detail?.profile_picture_url ? <img src={detail.profile_picture_url} className="w-11 h-11 rounded-full object-cover shadow-sm ring-1 ring-zinc-200" /> : <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-200 text-lg">{student.student_name.charAt(0).toUpperCase()}</div>}
              <div>
                <span className="text-[15px] font-semibold text-zinc-900 group-hover:text-indigo-700 transition-colors">{student.student_name}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {detail?.details?.is_hostler === 'Yes' && <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Hostler</span>}
                  {detail?.details?.transport_available === 'Yes' && <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">Transport</span>}
                  <span className="text-[11px] font-medium text-zinc-500">{updatedAt ? `Updated ${new Date(updatedAt).toLocaleDateString()}` : 'No updates'}</span>
                </div>
              </div>
            </div>
          </td>
          <td className="p-4 text-zinc-500 font-medium text-[13px]">{student.admission_number ? <span className="bg-zinc-100 px-2 py-1 rounded-md text-zinc-700 border border-zinc-200">#{student.admission_number}</span> : '—'}</td>
          <td className="min-w-[260px] p-4" onClick={e => e.stopPropagation()}><div className="flex gap-2"><select aria-label={`Class for ${student.student_name}`} className="h-9 min-w-28 rounded-md border border-zinc-200 bg-white px-2 text-[13px] font-medium text-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" value={value.classId} onChange={(event) => { const classId = event.target.value; setAssignments((current) => ({ ...current, [student.id]: { classId, sectionId: sectionsByClass[classId]?.[0]?.id ?? '' } })) }}>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select aria-label={`Section for ${student.student_name}`} className="h-9 min-w-24 rounded-md border border-zinc-200 bg-white px-2 text-[13px] font-medium text-zinc-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" value={value.sectionId} onChange={(event) => setAssignments((current) => ({ ...current, [student.id]: { ...value, sectionId: event.target.value } }))}>{choices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></td>
          <td className="p-4" onClick={e => e.stopPropagation()}><Button size="sm" variant="outline" className="h-9 text-[12px] font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50" disabled={isPending || !value.sectionId || (value.classId === student.class_id && value.sectionId === student.section_id)} onClick={() => saveAssignment(student)}>Save</Button></td>
          <td className="p-4" onClick={e => e.stopPropagation()}><Button size="sm" variant="ghost" className="h-9 text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50" onClick={() => { setEditing(student); setEditorOpen(true) }}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button></td>
        </tr> 
      })}</tbody></table></div>}
    </CardContent></Card>
    {(error || notice) && <p role="status" className={`whitespace-pre-line text-sm ${error ? 'text-destructive' : 'text-green-700'}`}>{error || notice}</p>}
    <StudentEditorSheet key={editing?.id ?? 'new'} orgId={orgId} open={editorOpen} onOpenChange={setEditorOpen} onSaved={(warning) => { if (warning) setError(warning); else setNotice(editing ? 'Student details updated.' : 'Student added.') }} student={editing} detail={details.find((item) => item.student_id === editing?.id)} classes={classes} sections={sections} subjects={subjects} houses={houses} />
    <Sheet open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-2xl overflow-y-auto">
        {viewing && (() => {
          const detail = details.find((item) => item.student_id === viewing.id);
          const cls = classes.find(c => c.id === viewing.class_id);
          const sec = sections.find(s => s.id === viewing.section_id);
          return (
            <>
              <SheetHeader className="border-b pb-6 mb-6">
                <div className="flex items-center gap-4">
                  {detail?.profile_picture_url ? <img src={detail.profile_picture_url} className="w-20 h-20 rounded-xl object-cover shadow-sm ring-1 ring-zinc-200" /> : <div className="w-20 h-20 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-200 text-3xl">{viewing.student_name.charAt(0).toUpperCase()}</div>}
                  <div>
                    <SheetTitle className="text-2xl">{viewing.student_name}</SheetTitle>
                    <SheetDescription className="text-sm mt-1 flex items-center gap-2">
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">Class: {cls?.name || 'N/A'}</span>
                      <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">Section: {sec?.name || 'N/A'}</span>
                      {viewing.admission_number && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium border border-indigo-100">#{viewing.admission_number}</span>}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="space-y-8">
                {/* Highlights / Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100 text-sm font-medium"><User className="w-4 h-4" /> Status: {viewing.status}</div>
                  {detail?.details?.is_hostler === 'Yes' && <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-3 py-2 rounded-lg border border-rose-100 text-sm font-medium"><Home className="w-4 h-4" /> Hostler</div>}
                  {detail?.details?.transport_available === 'Yes' && <div className="flex items-center gap-2 bg-sky-50 text-sky-700 px-3 py-2 rounded-lg border border-sky-100 text-sm font-medium"><Wallet className="w-4 h-4" /> Transport: Yes</div>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-4 bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                    <h3 className="font-semibold flex items-center gap-2 text-zinc-900 border-b border-zinc-200 pb-2"><User className="w-4 h-4 text-indigo-500" /> Personal Info</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                      <div><p className="text-zinc-500 text-xs mb-1">Gender</p><p className="font-medium text-zinc-900">{viewing.gender || '—'}</p></div>
                      <div><p className="text-zinc-500 text-xs mb-1">Date of Birth</p><p className="font-medium text-zinc-900">{viewing.date_of_birth || '—'}</p></div>
                      <div><p className="text-zinc-500 text-xs mb-1">Blood Group</p><p className="font-medium text-zinc-900">{detail?.details?.blood_group || '—'}</p></div>
                      <div><p className="text-zinc-500 text-xs mb-1">Religion</p><p className="font-medium text-zinc-900">{detail?.details?.religion || '—'}</p></div>
                    </div>
                  </div>

                  {/* Guardian Info */}
                  <div className="space-y-4 bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                    <h3 className="font-semibold flex items-center gap-2 text-zinc-900 border-b border-zinc-200 pb-2"><Home className="w-4 h-4 text-indigo-500" /> Guardian & Contact</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      <div><p className="text-zinc-500 text-xs mb-1">Guardian Name</p><p className="font-medium text-zinc-900">{viewing.guardian_name || '—'}</p></div>
                      <div><p className="text-zinc-500 text-xs mb-1">Phone Number</p><p className="font-medium text-zinc-900">{viewing.guardian_phone || '—'}</p></div>
                      <div><p className="text-zinc-500 text-xs mb-1">Email</p><p className="font-medium text-zinc-900">{viewing.guardian_email || '—'}</p></div>
                      <div><p className="text-zinc-500 text-xs mb-1">Address</p><p className="font-medium text-zinc-900">{detail?.details?.address_line_1 ? `${detail.details.address_line_1}, ${detail.details.city || ''}` : '—'}</p></div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions / Placeholders for future data */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-zinc-900">Student Data & Management</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all">
                      <Wallet className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Fees & Dues</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all">
                      <Calendar className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Attendance</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl text-center hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all">
                      <FileText className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <p className="text-sm font-medium">Documents</p>
                    </div>
                    <div className="bg-white border border-indigo-200 bg-indigo-50 p-4 rounded-xl text-center hover:bg-indigo-100 cursor-pointer transition-all" onClick={() => { setViewing(null); setEditing(viewing); setEditorOpen(true) }}>
                      <Pencil className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-indigo-700">Full Edit</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </SheetContent>
    </Sheet>
  </div>
}
