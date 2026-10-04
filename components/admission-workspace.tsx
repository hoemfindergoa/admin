'use client'

import { useState } from 'react'
import { Plus, Link as LinkIcon, Download, FileText, Calendar as CalendarIcon, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { createAdmissionForm } from '@/app/dashboard/[orgId]/admission/actions'

type ClassOption = { id: string; name: string }
type AdmissionForm = { id: string; name: string; deadline: string; classes: string[] }

export function AdmissionWorkspace({ orgId, classes, forms = [] }: { orgId: string; classes: ClassOption[]; forms?: AdmissionForm[] }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId) ? prev.filter(c => c !== classId) : [...prev, classId]
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.set('name', name)
      formData.set('deadline', deadline)
      formData.set('classes', JSON.stringify(selectedClasses))

      await createAdmissionForm(orgId, formData)

      setName('')
      setDeadline('')
      setSelectedClasses([])
      setOpen(false)
    } catch (err: any) {
      alert(err.message || 'Failed to create form. Ensure database tables exist.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPrintTemplate = () => {
    // We will redirect to a printable template page.
    window.open(`/dashboard/${orgId}/admission/template`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admissions</h1>
          <p className="mt-1 text-[14px] font-medium text-zinc-500">Manage online admission campaigns and offline forms.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={openPrintTemplate} className="border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm text-[13px] font-semibold h-10">
            <Download className="mr-2 h-4 w-4 text-zinc-500" />
            Download Paper Form
          </Button>
          <Button onClick={() => setOpen(true)} className="shadow-sm text-[13px] font-semibold h-10 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Admission Form
          </Button>
        </div>
      </div>

      {!forms.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 ring-1 ring-indigo-100">
            <FileText className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">No admission forms yet</h3>
          <p className="mt-2 max-w-md text-[14px] text-zinc-500 font-medium">Create an admission form to start accepting applications online. You can also download a paper template for offline admissions.</p>
          <Button onClick={() => setOpen(true)} className="mt-6 shadow-sm font-semibold bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> Create your first form
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map(form => (
            <div key={form.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col transition-all hover:border-indigo-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/50">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 leading-tight">{form.name}</h3>
                </div>
              </div>
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-500">
                  <CalendarIcon className="h-4 w-4 text-zinc-400" />
                  Deadline: {new Date(form.deadline).toLocaleDateString()}
                </div>
                <div className="flex items-start gap-2 text-[13px] font-medium text-zinc-500">
                  <Users className="h-4 w-4 text-zinc-400 mt-0.5" />
                  <span>{form.classes.length} Classes allowed</span>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100">
                <Button variant="outline" className="w-full justify-center h-9 text-[13px] font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                  <LinkIcon className="mr-2 h-3.5 w-3.5" /> Copy Public Link
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto bg-white p-0">
          <div className="px-6 py-6 border-b border-zinc-100 bg-zinc-50/50">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Create Admission Form</SheetTitle>
              <SheetDescription className="text-[13px] font-medium text-zinc-500">Configure a new admission campaign for online registration.</SheetDescription>
            </SheetHeader>
          </div>
          <form onSubmit={handleCreate} className="px-6 py-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-zinc-900">Name <span className="text-red-500">*</span></Label>
                <Input
                  required
                  placeholder="i.e. Highschool Admission form"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-10 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-zinc-900">Deadline <span className="text-red-500">*</span></Label>
                <Input
                  required
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="h-10 font-medium"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[13px] font-bold text-zinc-900">Classrooms <span className="text-red-500">*</span></Label>
                <p className="text-xs text-zinc-500 font-medium -mt-2 mb-3">Select the classes open for admission.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {classes.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleClass(c.id)}
                      className={`flex items-center justify-center p-3 rounded-xl border text-[13px] font-semibold cursor-pointer transition-all ${selectedClasses.includes(c.id)
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-[13px] font-bold text-zinc-900 block border-b border-zinc-100 pb-2">Fields Included in this Form (Read-only)</Label>
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-zinc-700">1. Personal Details</p>
                  <p className="text-[12px] text-zinc-500 pl-4">Name, Father's Name, Mother's Name, DOB, Gender, Mobile, Religion, Category, Aadhar, etc.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-zinc-700">2. Educational Information</p>
                  <p className="text-[12px] text-zinc-500 pl-4">Class of Admission, Last Institute, Previous Class %, Special Educational Needs.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-zinc-700">3. Parents</p>
                  <p className="text-[12px] text-zinc-500 pl-4">Occupation, Qualification, Family Income, Emails.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] font-semibold text-zinc-700">4. Address & Guardian</p>
                  <p className="text-[12px] text-zinc-500 pl-4">House/Ward, Village, Post Office, District, State, Pincode. Guardian Details & Emergency Contact.</p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 -mx-6 -mb-8 px-6 py-4 bg-white border-t border-zinc-100 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-semibold text-zinc-600" disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={!name || !deadline || selectedClasses.length === 0 || isSubmitting} className="font-semibold bg-indigo-600 hover:bg-indigo-700">
                {isSubmitting ? 'Publishing...' : 'Publish Form'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
