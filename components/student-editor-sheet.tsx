'use client'

import { FormEvent, ReactNode, useId, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { saveStudent } from '@/app/dashboard/[orgId]/students/actions'

type Option = { id: string; name: string }
type Detail = { student_id: string; house_id: string | null; active_fee: number | null; optional_subjects: string[]; details: Record<string, string | null>; siblings: Array<{ name: string; class: string }>; concessions: Array<{ name: string; amount: string; note: string }>; profile_picture_path: string | null; profile_picture_url?: string | null; updated_at: string; updated_by_email: string | null }
type Student = { id: string; student_name: string; admission_number: string | null; date_of_birth: string | null; gender: string | null; guardian_name: string | null; guardian_phone: string | null; guardian_email: string | null; class_id: string; section_id: string; status: string;[key: string]: unknown }
type Props = { orgId: string; open: boolean; onOpenChange: (open: boolean) => void; onSaved?: (warning: string | null) => void; student?: Student | null; detail?: Detail | null; classes: Array<Option & { name: string }>; sections: Array<Option & { class_id: string }>; subjects: Array<Option & { class_id: string; section_id: string }>; houses: Option[] }

const basic = [
  ['admission_number', 'Admission No.'], ['roll_number', 'Roll No.'], ['registration_number', 'Reg No.'],
  ['student_type', 'Student Type', 'select:Preschool,Day care,Pre nursery,Nursery,LKG,UKG,Class 1,Class 2,Class 3,Class 4,Class 5,Class 6,Class 7,Class 8,Class 9,Class 10,Class 11,Class 12'],
  ['student_name', 'Student name', 'required'], ['date_of_birth', 'Date of birth', 'date'], ['phone', 'Phone', 'required'],
  ['gender', 'Gender', 'select:Female,Male,Other'], ['email', 'Email', 'email'], ['category', 'Category', 'select:General,OBC,SC,ST,EWS,Other'],
] as const
const personal = [
  ['transport_type', 'Transport Type', 'select:School bus,Self transport,Parent pickup,Walking'], ['caste', 'Caste'], ['nationality', 'Nationality'],
  ['place_of_birth', 'Place of birth'], ['identity_mark', 'Identity mark'], ['pen_no', 'PEN no.'], ['apaar_id', 'APAAR ID'], ['student_code', 'Student code'],
  ['religion', 'Religion', 'select:Hindu,Muslim,Christian,Sikh,Buddhist,Jain,Other'], ['birth_certificate', 'Birth Certificate'], ['admission_date', 'Admission Date', 'date'],
  ['aadhaar', 'Aadhaar'], ['pan', 'PAN'], ['blood_group', 'Blood Group', 'select:A+,A-,B+,B-,AB+,AB-,O+,O-'],
  ['is_hostler', 'Is Hostler', 'select:Yes,No'], ['transport_available', 'Transport Available', 'select:Yes,No']
] as const
const detailSections: Array<{ title: string; fields: Array<[string, string, string?]> }> = [
  { title: 'Address information', fields: [['address_line_1', 'Address line 1'], ['address_line_2', 'Address line 2'], ['city', 'City'], ['state', 'State'], ['postal_code', 'Postal code'], ['country', 'Country']] },
  { title: 'Father details', fields: [['father_name', "Father's name"], ['father_phone', "Father's contact number"], ['father_email', "Father's email", 'email'], ['father_qualification', 'Educational qualification'], ['father_occupation', 'Occupation'], ['father_annual_income', 'Annual income', 'number'], ['father_office_phone', 'Office contact number'], ['father_aadhaar', 'Aadhaar']] },
  { title: 'Mother details', fields: [['mother_name', "Mother's name"], ['mother_phone', "Mother's contact number"], ['mother_email', "Mother's email", 'email'], ['mother_qualification', 'Educational qualification'], ['mother_occupation', 'Occupation'], ['mother_annual_income', 'Annual income', 'number'], ['mother_office_phone', 'Office contact number'], ['mother_aadhaar', 'Aadhaar']] },
  { title: 'Guardian and emergency contact', fields: [['guardian_name', 'Guardian name'], ['guardian_phone', 'Guardian contact number'], ['guardian_email', 'Guardian email', 'email'], ['guardian_relation', 'Relationship'], ['guardian_address', 'Guardian address'], ['emergency_contact', 'Emergency contact number']] },
  { title: 'Previous school and support', fields: [['previous_organization', 'Previous organization'], ['previous_institute', 'Last institute attended'], ['tc_number', 'TC number'], ['previous_class', 'Previous class'], ['previous_percentage', 'Previous percentage', 'number'], ['special_needs', 'Special needs']] },
]

function Field({ id, label, kind, value, onChange, required }: { id: string; label: string; kind?: string; value?: string; onChange?: (value: string) => void; required?: boolean }) {
  const parsed = kind?.startsWith('select:') ? kind.slice(7).split(',') : null
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>{parsed ? <select id={id} name={id} required={required} value={onChange ? value ?? '' : undefined} defaultValue={onChange ? undefined : value ?? ''} onChange={(event) => onChange?.(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select…</option>{parsed.map((option) => <option key={option}>{option}</option>)}</select> : <Input id={id} name={id} type={kind === 'date' ? 'date' : kind === 'number' ? 'number' : kind === 'email' ? 'email' : 'text'} min={kind === 'number' ? '0' : undefined} required={required} value={onChange ? value : undefined} defaultValue={onChange ? undefined : value} onChange={(event) => onChange?.(event.target.value)} />}</div>
}

function CollapsibleSection({ title, description, defaultOpen = false, collapsible = true, children }: { title: string; description?: string; defaultOpen?: boolean; collapsible?: boolean; children: ReactNode }) {
  const [expanded, setExpanded] = useState(defaultOpen)
  const contentId = useId()
  return <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
    {collapsible ? <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/50 sm:px-5">
      <span className="min-w-0"><span className="block font-semibold tracking-tight">{title}</span>{description && <span className="mt-1 block text-xs text-muted-foreground">{description}</span>}</span>
      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
    </button> : <div className="px-4 py-4 sm:px-5"><span className="block font-semibold tracking-tight">{title}</span>{description && <span className="mt-1 block text-xs text-muted-foreground">{description}</span>}</div>}
    <div id={contentId} hidden={collapsible && !expanded} className="border-t px-4 py-4 sm:px-5">{children}</div>
  </section>
}

export function StudentEditorSheet({ orgId, open, onOpenChange, onSaved, student, detail, classes, sections, subjects, houses }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [classId, setClassId] = useState(student?.class_id ?? '')
  const [sectionId, setSectionId] = useState(student?.section_id ?? '')
  const [houseId, setHouseId] = useState(detail?.house_id ?? '')
  const [newHouse, setNewHouse] = useState('')
  const [siblings, setSiblings] = useState(detail?.siblings ?? [])
  const [concessions, setConcessions] = useState(detail?.concessions ?? [])
  const [optionalSubjects, setOptionalSubjects] = useState(detail?.optional_subjects ?? [])
  const [profile, setProfile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const detailValue = (key: string) => detail?.details?.[key] ?? ''
  const basicValue = (id: string) => id === 'student_name' ? student?.student_name ?? undefined : id === 'admission_number' ? student?.admission_number ?? undefined : id === 'roll_number' ? String(student?.roll_number ?? '') : id === 'registration_number' ? String(student?.registration_number ?? '') : id === 'student_type' ? String(student?.student_type ?? '') : id === 'transport_type' ? String(student?.transport_type ?? '') : id === 'category' ? String(student?.category ?? '') : id === 'email' ? String(student?.email ?? '') : id === 'phone' ? String(student?.phone ?? '') : id === 'date_of_birth' ? student?.date_of_birth ?? undefined : id === 'gender' ? student?.gender ?? undefined : detailValue(id)
  const classSections = sections.filter((section) => section.class_id === classId)
  const sectionSubjects = subjects.filter((subject) => subject.class_id === classId && subject.section_id === sectionId)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('student_id', student?.id ?? '')
    formData.set('class_id', classId); formData.set('section_id', sectionId); formData.set('house_id', houseId)
    formData.set('new_house_name', newHouse)
    formData.set('siblings', JSON.stringify(siblings)); formData.set('concessions', JSON.stringify(concessions)); formData.set('optional_subjects', JSON.stringify(optionalSubjects))
    if (detail?.profile_picture_path) formData.set('existing_profile_picture_path', detail.profile_picture_path)
    if (profile) formData.set('profile_picture', profile)
    startTransition(async () => {
      try { const result = await saveStudent(orgId, formData); onOpenChange(false); onSaved?.(result.warning); router.refresh() }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save student.') }
    })
  }

  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
    <SheetHeader className="pr-9"><SheetTitle>{student ? 'Edit student' : 'Add student'}</SheetTitle><SheetDescription>Keep core enrolment information together and add family and school details whenever they are available.</SheetDescription></SheetHeader>
    <form onSubmit={submit} className="mt-6 space-y-6 pb-16">
      <CollapsibleSection title="Basic details" description="Class, section, name, phone, student type and category are required." defaultOpen collapsible={false}>
        <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label>Classroom <span className="text-destructive">*</span></Label><select required value={classId} onChange={(event) => { setClassId(event.target.value); setSectionId(''); setOptionalSubjects([]) }} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select…</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div className="space-y-1.5"><Label>Section <span className="text-destructive">*</span></Label><select required value={sectionId} onChange={(event) => { setSectionId(event.target.value); setOptionalSubjects([]) }} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select…</option>{classSections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          {basic.map(([id, label, kind]) => <Field key={id} id={id} label={label} kind={kind} required={kind === 'required' || id === 'student_type' || id === 'category'} value={basicValue(id)} />)}
          <div className="space-y-1.5"><Label>House</Label><select value={houseId} onChange={(event) => { setHouseId(event.target.value); setNewHouse('') }} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">No house</option>{houses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Label htmlFor="new_house_name" className="text-xs text-muted-foreground">Create New House</Label><Input id="new_house_name" name="new_house_name" placeholder="House name" value={newHouse} onChange={(event) => { setNewHouse(event.target.value); if (event.target.value) setHouseId('') }} /></div>
        </div>
        {sectionSubjects.length > 0 && <div className="space-y-2"><Label>Optional subjects</Label><div className="grid gap-2 sm:grid-cols-2">{sectionSubjects.map((subject) => <label key={subject.id} className="flex items-center gap-2 rounded-md border p-2 text-sm"><input type="checkbox" checked={optionalSubjects.includes(subject.id)} onChange={(event) => setOptionalSubjects((current) => event.target.checked ? [...current, subject.id] : current.filter((id) => id !== subject.id))} />{subject.name}</label>)}</div></div>}
      </CollapsibleSection>
      <CollapsibleSection title="Personal and identity details" description="Optional identification, transport and admission information."><div className="grid gap-4 sm:grid-cols-2">{personal.map(([id, label, kind]) => <Field key={id} id={id} label={label} kind={kind} value={basicValue(id)} />)}</div></CollapsibleSection>
      {detailSections.map((section) => <CollapsibleSection key={section.title} title={section.title}><div className="grid gap-4 sm:grid-cols-2">{section.fields.map(([id, label, kind]) => <Field key={id} id={id} label={label} kind={kind} value={id === 'guardian_name' ? student?.guardian_name ?? undefined : id === 'guardian_phone' ? student?.guardian_phone ?? undefined : id === 'guardian_email' ? student?.guardian_email ?? undefined : detailValue(id)} />)}</div></CollapsibleSection>)}
      <CollapsibleSection title="Siblings" description="Add more than one sibling if needed.">{<div className="space-y-3">{siblings.map((item, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><Input aria-label="Sibling name" placeholder="Sibling name" value={item.name} onChange={(event) => setSiblings((current) => current.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} /><Input aria-label="Sibling class" placeholder="Class" value={item.class} onChange={(event) => setSiblings((current) => current.map((row, i) => i === index ? { ...row, class: event.target.value } : row))} /><Button type="button" size="icon" variant="ghost" aria-label="Remove sibling" onClick={() => setSiblings((current) => current.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}<Button type="button" variant="outline" size="sm" onClick={() => setSiblings((current) => [...current, { name: '', class: '' }])}><Plus className="mr-2 h-4 w-4" />Add sibling</Button></div>}</CollapsibleSection>
      <CollapsibleSection title="Concession details">{<div className="space-y-3">{concessions.map((item, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_140px_1fr_auto]"><Input aria-label="Concession" placeholder="Concession" value={item.name} onChange={(event) => setConcessions((current) => current.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} /><Input aria-label="Concession amount" placeholder="Amount" type="number" min="0" value={item.amount} onChange={(event) => setConcessions((current) => current.map((row, i) => i === index ? { ...row, amount: event.target.value } : row))} /><Input aria-label="Concession note" placeholder="Note" value={item.note} onChange={(event) => setConcessions((current) => current.map((row, i) => i === index ? { ...row, note: event.target.value } : row))} /><Button type="button" size="icon" variant="ghost" aria-label="Remove concession" onClick={() => setConcessions((current) => current.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></Button></div>)}<Button type="button" variant="outline" size="sm" onClick={() => setConcessions((current) => [...current, { name: '', amount: '', note: '' }])}><Plus className="mr-2 h-4 w-4" />Add concession</Button></div>}</CollapsibleSection>
      <CollapsibleSection title="Profile picture and fees" description="Photo and optional active fee."><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="profile_picture">Profile picture</Label><Input id="profile_picture" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setProfile(event.target.files?.[0] ?? null)} />{detail?.profile_picture_url && !profile && <img src={detail.profile_picture_url} alt="Student profile" className="h-16 w-16 rounded-full object-cover" />}<p className="text-xs text-muted-foreground"><Camera className="mr-1 inline h-3 w-3" />JPG, PNG or WebP · up to 5 MB</p></div><Field id="active_fee" label="Active fee" kind="number" value={detail?.active_fee == null ? '' : String(detail.active_fee)} /></div><p className="mt-4 text-xs text-muted-foreground">Student and parent passwords are never stored here. A parent login invite is sent to the guardian email to set a password securely.</p></CollapsibleSection>
      {detail && <p className="text-xs text-muted-foreground">Last updated {new Date(detail.updated_at).toLocaleString()} · {detail.updated_by_email ?? 'School staff'}</p>}
      {error && <p role="alert" className="whitespace-pre-line text-sm text-destructive">{error}</p>}
      <div className="sticky bottom-0 -mx-6 flex justify-end gap-2 border-t bg-background px-6 py-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={pending}>{pending ? 'Saving…' : student ? 'Save changes' : 'Add student'}</Button></div>
    </form>
  </SheetContent></Sheet>
}
