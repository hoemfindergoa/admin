'use client'

import { FormEvent, ReactNode, useId, useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ChevronDown, Plus, Trash2, Wand2, User, Home, Users, Briefcase, GraduationCap, Link2, BookOpen, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { saveStudent } from '@/app/dashboard/[orgId]/students/actions'
import { cn } from '@/lib/utils'

type Option = { id: string; name: string }
type Detail = { student_id: string; house_id: string | null; active_fee: number | null; optional_subjects: string[]; details: Record<string, string | null>; siblings: Array<{ name: string; class: string }>; concessions: Array<{ name: string; amount: string; note: string }>; profile_picture_path: string | null; profile_picture_url?: string | null; updated_at: string; updated_by_email: string | null }
type Student = { id: string; student_name: string; admission_number: string | null; date_of_birth: string | null; gender: string | null; guardian_name: string | null; guardian_phone: string | null; guardian_email: string | null; class_id: string; section_id: string; status: string;[key: string]: unknown }
type Props = { orgId: string; open: boolean; onOpenChange: (open: boolean) => void; onSaved?: (warning: string | null) => void; student?: Student | null; detail?: Detail | null; classes: Array<Option & { name: string }>; sections: Array<Option & { class_id: string }>; subjects: Array<Option & { class_id: string; section_id: string }>; houses: Option[] }

const basic = [
  ['roll_number', 'Roll No.'],
  ['student_name', 'Student name', 'required'], 
  ['date_of_birth', 'Date of birth', 'date'], 
  ['phone', 'Phone', 'required'],
  ['gender', 'Gender', 'select:Female,Male,Other'], 
  ['email', 'Email', 'email']
] as const

const personal = [
  ['transport_type', 'Transport Type', 'select:School bus,Self transport,Parent pickup,Walking'], 
  ['nationality', 'Nationality'],
  ['place_of_birth', 'Place of birth'], 
  ['identity_mark', 'Identity mark'], 
  ['pen_no', 'PEN no.'], 
  ['apaar_id', 'APAAR ID'], 
  ['student_code', 'Student code'],
  ['birth_certificate', 'Birth Certificate'], 
  ['admission_date', 'Admission Date', 'date'],
  ['aadhaar', 'Aadhaar'], 
  ['pan', 'PAN'], 
  ['blood_group', 'Blood Group', 'select:A+,A-,B+,B-,AB+,AB-,O+,O-'],
  ['is_hostler', 'Is Hostler', 'select:Yes,No'], 
  ['transport_available', 'Transport Available', 'select:Yes,No']
] as const

const detailSections: Array<{ title: string; icon: any; color: string; fields: Array<[string, string, string?]> }> = [
  { title: 'Address Information', icon: Home, color: 'bg-emerald-50/50 border-emerald-100', fields: [['address_line_1', 'Address line 1'], ['address_line_2', 'Address line 2'], ['city', 'City'], ['state', 'State'], ['postal_code', 'Postal code'], ['country', 'Country']] },
  { title: 'Father Details', icon: Users, color: 'bg-blue-50/50 border-blue-100', fields: [['father_name', "Father's name"], ['father_phone', "Father's contact number"], ['father_email', "Father's email", 'email'], ['father_qualification', 'Educational qualification'], ['father_occupation', 'Occupation'], ['father_annual_income', 'Annual income', 'number'], ['father_office_phone', 'Office contact number'], ['father_aadhaar', 'Aadhaar']] },
  { title: 'Mother Details', icon: Users, color: 'bg-rose-50/50 border-rose-100', fields: [['mother_name', "Mother's name"], ['mother_phone', "Mother's contact number"], ['mother_email', "Mother's email", 'email'], ['mother_qualification', 'Educational qualification'], ['mother_occupation', 'Occupation'], ['mother_annual_income', 'Annual income', 'number'], ['mother_office_phone', 'Office contact number'], ['mother_aadhaar', 'Aadhaar']] },
  { title: 'Guardian & Emergency', icon: Briefcase, color: 'bg-amber-50/50 border-amber-100', fields: [['guardian_name', 'Guardian name'], ['guardian_phone', 'Guardian contact number'], ['guardian_email', 'Guardian email', 'email'], ['guardian_relation', 'Relationship'], ['guardian_address', 'Guardian address'], ['emergency_contact', 'Emergency contact number']] },
  { title: 'Previous School', icon: GraduationCap, color: 'bg-purple-50/50 border-purple-100', fields: [['previous_organization', 'Previous organization'], ['previous_institute', 'Last institute attended'], ['tc_number', 'TC number'], ['previous_class', 'Previous class'], ['previous_percentage', 'Previous percentage', 'number'], ['special_needs', 'Special needs']] },
]

function Field({ id, label, kind, value, onChange, required, className }: { id: string; label: string; kind?: string; value?: string; onChange?: (value: string) => void; required?: boolean; className?: string }) {
  const parsed = kind?.startsWith('select:') ? kind.slice(7).split(',') : null
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}{required && <span className="text-rose-500"> *</span>}
      </Label>
      {parsed ? (
        <select 
          id={id} name={id} required={required} 
          value={onChange ? value ?? '' : undefined} 
          defaultValue={onChange ? undefined : value ?? ''} 
          onChange={(event) => onChange?.(event.target.value)} 
          className="h-10 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select…</option>
          {parsed.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <Input 
          id={id} name={id} 
          type={kind === 'date' ? 'date' : kind === 'number' ? 'number' : kind === 'email' ? 'email' : 'text'} 
          min={kind === 'number' ? '0' : undefined} 
          required={required} 
          value={onChange ? value : undefined} 
          defaultValue={onChange ? undefined : value} 
          onChange={(event) => onChange?.(event.target.value)}
          className="h-10 bg-white border-zinc-200/80 shadow-sm rounded-lg" 
        />
      )}
    </div>
  )
}

function CollapsibleSection({ title, icon: Icon, color, defaultOpen = false, collapsible = true, children }: { title: string; icon?: any; color?: string; defaultOpen?: boolean; collapsible?: boolean; children: ReactNode }) {
  const [expanded, setExpanded] = useState(defaultOpen)
  const contentId = useId()
  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-white shadow-sm transition-all", color ? color : "border-zinc-200")}>
      {collapsible ? (
        <button type="button" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded((value) => !value)} className={cn("flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors", expanded ? "border-b border-inherit" : "")}>
          <div className="flex items-center gap-3">
            {Icon && <div className="p-2 rounded-lg bg-white/50 shadow-sm ring-1 ring-black/5"><Icon className="w-4 h-4 text-zinc-600" /></div>}
            <span className="font-bold tracking-tight text-zinc-900">{title}</span>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <div className={cn("px-5 py-4 border-b", color ? "border-inherit" : "border-zinc-100")}>
          <div className="flex items-center gap-3">
            {Icon && <div className="p-2 rounded-lg bg-white/50 shadow-sm ring-1 ring-black/5"><Icon className="w-4 h-4 text-zinc-600" /></div>}
            <span className="font-bold tracking-tight text-zinc-900">{title}</span>
          </div>
        </div>
      )}
      <div id={contentId} hidden={collapsible && !expanded} className="px-5 py-5">{children}</div>
    </section>
  )
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
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  
  // Custom Admission Number State
  const [admissionNo, setAdmissionNo] = useState(student?.admission_number ?? '')

  useEffect(() => {
    if (!profile) {
      setProfilePreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(profile)
    setProfilePreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [profile])

  const detailValue = (key: string) => detail?.details?.[key] ?? ''
  const basicValue = (id: string) => id === 'student_name' ? student?.student_name ?? undefined : id === 'roll_number' ? String(student?.roll_number ?? '') : id === 'transport_type' ? String(student?.transport_type ?? '') : id === 'email' ? String(student?.email ?? '') : id === 'phone' ? String(student?.phone ?? '') : id === 'date_of_birth' ? student?.date_of_birth ?? undefined : id === 'gender' ? student?.gender ?? undefined : detailValue(id)
  
  const classSections = sections.filter((section) => section.class_id === classId)
  const sectionSubjects = subjects.filter((subject) => subject.class_id === classId && subject.section_id === sectionId)

  const generateAdmissionNo = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    setAdmissionNo(`ADM${year}${random}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const form = event.currentTarget
    const formData = new FormData(form)
    formData.set('student_id', student?.id ?? '')
    formData.set('class_id', classId); formData.set('section_id', sectionId); formData.set('house_id', houseId)
    formData.set('new_house_name', newHouse)
    
    // Explicitly set admission number
    formData.set('admission_number', admissionNo)

    formData.set('siblings', JSON.stringify(siblings)); formData.set('concessions', JSON.stringify(concessions)); formData.set('optional_subjects', JSON.stringify(optionalSubjects))
    if (detail?.profile_picture_path) formData.set('existing_profile_picture_path', detail.profile_picture_path)
    if (profile) formData.set('profile_picture', profile)
    startTransition(async () => {
      try { const result = await saveStudent(orgId, formData); onOpenChange(false); onSaved?.(result.warning); router.refresh() }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save student.') }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl bg-zinc-50 p-0 flex flex-col">
        <SheetHeader className="p-6 bg-white border-b border-zinc-100 shrink-0">
          <SheetTitle className="text-xl flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            {student ? 'Edit Student Profile' : 'Add New Student'}
          </SheetTitle>
          <SheetDescription>
            Keep core enrolment information together and add family details whenever they are available.
          </SheetDescription>
        </SheetHeader>
        
        <form id="student-form" onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <CollapsibleSection title="Basic Details" icon={User} defaultOpen collapsible={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Classroom <span className="text-rose-500">*</span></Label>
                <select required value={classId} onChange={(event) => { setClassId(event.target.value); setSectionId(''); setOptionalSubjects([]) }} className="h-10 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                  <option value="">Select…</option>
                  {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Section <span className="text-rose-500">*</span></Label>
                <select required value={sectionId} onChange={(event) => { setSectionId(event.target.value); setOptionalSubjects([]) }} className="h-10 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                  <option value="">Select…</option>
                  {classSections.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>

              {/* Admission Number Field */}
              <div className="space-y-1.5">
                <Label htmlFor="admission_number" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Admission No. <span className="text-rose-500">*</span></Label>
                <div className="flex gap-2">
                  <Input 
                    id="admission_number" 
                    required 
                    value={admissionNo} 
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g. ADM2026..."
                    className="h-10 bg-white border-zinc-200/80 shadow-sm rounded-lg" 
                  />
                  <Button type="button" onClick={generateAdmissionNo} variant="outline" className="h-10 px-3 bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shrink-0" title="Auto-generate">
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {basic.map(([id, label, kind]) => <Field key={id} id={id} label={label} kind={kind} required={kind === 'required'} value={basicValue(id)} />)}
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">House</Label>
                <select value={houseId} onChange={(event) => { setHouseId(event.target.value); setNewHouse('') }} className="h-10 w-full rounded-lg border border-zinc-200/80 bg-white px-3 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                  <option value="">No house</option>
                  {houses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <div className="pt-2">
                  <Label htmlFor="new_house_name" className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">Or Create New House</Label>
                  <Input id="new_house_name" name="new_house_name" placeholder="House name" value={newHouse} onChange={(event) => { setNewHouse(event.target.value); if (event.target.value) setHouseId('') }} className="h-8 mt-1 text-sm bg-white border-zinc-200/80" />
                </div>
              </div>
            </div>
            {sectionSubjects.length > 0 && <div className="space-y-2 mt-4"><Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Optional subjects</Label><div className="grid gap-2 sm:grid-cols-2">{sectionSubjects.map((subject) => <label key={subject.id} className="flex items-center gap-2 rounded-lg border border-zinc-200/80 bg-white p-3 text-sm shadow-sm cursor-pointer hover:border-indigo-200 transition-colors"><input type="checkbox" checked={optionalSubjects.includes(subject.id)} onChange={(event) => setOptionalSubjects((current) => event.target.checked ? [...current, subject.id] : current.filter((id) => id !== subject.id))} className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />{subject.name}</label>)}</div></div>}
          </CollapsibleSection>

          {/* Profile Picture highlighted after Basic Details */}
          <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/30 shadow-sm transition-all p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-100 shadow-sm ring-1 ring-black/5"><Camera className="w-4 h-4 text-indigo-700" /></div>
              <span className="font-bold tracking-tight text-indigo-900">Profile Picture & Fees</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 items-center">
              <div className="space-y-2">
                <Label htmlFor="profile_picture" className="text-xs font-bold uppercase tracking-wider text-indigo-700">Upload Photo</Label>
                <div className="flex items-center gap-4">
                  {profilePreview || detail?.profile_picture_url ? (
                    <img src={profilePreview || detail?.profile_picture_url!} alt="Student profile" className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-200 shadow-sm" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-white border-2 border-dashed border-indigo-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-indigo-300" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input id="profile_picture" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setProfile(event.target.files?.[0] ?? null)} className="h-10 bg-white border-indigo-100 cursor-pointer file:text-indigo-600 file:bg-indigo-50 file:border-0 file:rounded file:px-2 file:mr-2" />
                    <p className="text-[10px] text-indigo-500 mt-1 font-medium">JPG, PNG or WebP · up to 5 MB</p>
                  </div>
                </div>
              </div>
              <Field id="active_fee" label="Active fee (Optional)" kind="number" value={detail?.active_fee == null ? '' : String(detail.active_fee)} className="[&>label]:text-indigo-700 [&>input]:border-indigo-100" />
            </div>
            <p className="mt-4 text-[11px] font-medium text-indigo-600/80 bg-white/50 p-2 rounded-lg border border-indigo-100/50">Student and parent passwords are never stored here. A parent login invite is sent to the guardian email to set a password securely.</p>
          </section>

          <CollapsibleSection title="Personal and Identity Details" icon={Link2} color="bg-zinc-50/80 border-zinc-200" defaultOpen={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              {personal.map(([id, label, kind]) => <Field key={id} id={id} label={label} kind={kind} value={basicValue(id)} />)}
            </div>
          </CollapsibleSection>

          {detailSections.map((section) => (
            <CollapsibleSection key={section.title} title={section.title} icon={section.icon} color={section.color}>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map(([id, label, kind]) => <Field key={id} id={id} label={label} kind={kind} value={id === 'guardian_name' ? student?.guardian_name ?? undefined : id === 'guardian_phone' ? student?.guardian_phone ?? undefined : id === 'guardian_email' ? student?.guardian_email ?? undefined : detailValue(id)} />)}
              </div>
            </CollapsibleSection>
          ))}

          <CollapsibleSection title="Siblings" icon={Users} color="bg-cyan-50/50 border-cyan-100">
            <div className="space-y-3">
              {siblings.map((item, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <Input aria-label="Sibling name" placeholder="Sibling name" value={item.name} onChange={(event) => setSiblings((current) => current.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} className="h-10 bg-white border-zinc-200/80" />
                  <Input aria-label="Sibling class" placeholder="Class" value={item.class} onChange={(event) => setSiblings((current) => current.map((row, i) => i === index ? { ...row, class: event.target.value } : row))} className="h-10 bg-white border-zinc-200/80" />
                  <Button type="button" size="icon" variant="ghost" aria-label="Remove sibling" onClick={() => setSiblings((current) => current.filter((_, i) => i !== index))} className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setSiblings((current) => [...current, { name: '', class: '' }])} className="h-9 border-dashed border-2 text-zinc-600 hover:bg-white rounded-lg"><Plus className="mr-2 h-4 w-4" />Add sibling</Button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Concession Details" icon={BookOpen} color="bg-fuchsia-50/50 border-fuchsia-100">
            <div className="space-y-3">
              {concessions.map((item, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_140px_1fr_auto]">
                  <Input aria-label="Concession" placeholder="Concession" value={item.name} onChange={(event) => setConcessions((current) => current.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} className="h-10 bg-white border-zinc-200/80" />
                  <Input aria-label="Concession amount" placeholder="Amount" type="number" min="0" value={item.amount} onChange={(event) => setConcessions((current) => current.map((row, i) => i === index ? { ...row, amount: event.target.value } : row))} className="h-10 bg-white border-zinc-200/80" />
                  <Input aria-label="Concession note" placeholder="Note" value={item.note} onChange={(event) => setConcessions((current) => current.map((row, i) => i === index ? { ...row, note: event.target.value } : row))} className="h-10 bg-white border-zinc-200/80" />
                  <Button type="button" size="icon" variant="ghost" aria-label="Remove concession" onClick={() => setConcessions((current) => current.filter((_, i) => i !== index))} className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setConcessions((current) => [...current, { name: '', amount: '', note: '' }])} className="h-9 border-dashed border-2 text-zinc-600 hover:bg-white rounded-lg"><Plus className="mr-2 h-4 w-4" />Add concession</Button>
            </div>
          </CollapsibleSection>

          {detail && <p suppressHydrationWarning className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider text-center pt-2">Last updated {new Date(detail.updated_at).toLocaleString()} · {detail.updated_by_email ?? 'School staff'}</p>}
          {error && <p role="alert" className="whitespace-pre-line text-sm font-medium text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}
        </form>
        
        <div className="flex justify-end gap-3 border-t border-zinc-100 bg-white p-5 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-xl">Cancel</Button>
          <Button type="submit" form="student-form" disabled={pending} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold px-6">
            {pending ? (
              <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Saving…</span>
            ) : student ? 'Save changes' : 'Add student'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
