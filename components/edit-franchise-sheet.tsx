'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { updateOrganization, deleteOrganization } from '@/app/dashboard/actions'

interface Org {
  id: string
  name: string
  franchise_brand?: string | null
  affiliation?: string | null
  course_type?: string | null
  session_start_date?: string | null
  session_end_date?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  logo_url?: string | null
}

interface EditFranchiseSheetProps {
  org: Org
  trigger?: React.ReactNode
}

export function EditFranchiseSheet({ org, trigger }: EditFranchiseSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  
  const initialAffiliationMode = ['CBSE', 'ICSE', 'State Board'].includes(org.affiliation || '') ? 'select' : (org.affiliation ? 'custom' : 'select')
  const [affiliationMode, setAffiliationMode] = useState<'select' | 'custom'>(initialAffiliationMode)
  const [affiliationValue, setAffiliationValue] = useState(org.affiliation || '')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    if (affiliationMode === 'custom') {
      formData.set('affiliation', affiliationValue)
    }

    startTransition(async () => {
      try {
        await updateOrganization(org.id, formData)
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        setError(err?.message ?? 'Something went wrong. Please try again.')
      }
    })
  }

  function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${org.name}? This action cannot be undone and will delete all associated data.`)) return

    setError(null)
    startTransition(async () => {
      try {
        await deleteOrganization(org.id)
        setOpen(false)
        router.refresh()
      } catch (err: any) {
        setError(err?.message ?? 'Failed to delete franchise. It may have dependent data (like students or staff) that needs to be deleted first.')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="ghost" size="icon" className="shrink-0 -mt-2 -mr-2 text-zinc-400 hover:text-indigo-600">
            <Settings className="w-5 h-5" />
            <span className="sr-only">Settings</span>
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-zinc-50 p-0 flex flex-col">
        <SheetHeader className="p-6 bg-white border-b border-zinc-100 shrink-0">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            Edit Franchise Settings
          </SheetTitle>
          <SheetDescription>
            Update the details for <span className="font-medium text-zinc-900">{org.name}</span>.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
            <Label htmlFor="ef-name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Franchise Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="ef-name"
              name="name"
              required
              defaultValue={org.name}
              disabled={isPending}
              className="h-10"
            />
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
            <Label htmlFor="ef-franchise_brand" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Franchise Brand
            </Label>
            <Select name="franchise_brand" defaultValue={org.franchise_brand || undefined} disabled={isPending}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select Franchise Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Little dreamers">Little dreamers</SelectItem>
                <SelectItem value="Motherhood">Motherhood</SelectItem>
                <SelectItem value="best pre school">Best pre school</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
            <Label htmlFor="ef-logo" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Franchise Logo
            </Label>
            {org.logo_url && (
              <div className="mb-3 mt-1">
                <img src={org.logo_url} alt="Current logo" className="h-14 w-14 rounded-lg object-contain bg-zinc-50 border border-zinc-200 p-1 shadow-sm" />
              </div>
            )}
            <Input
              id="ef-logo"
              name="logo_file"
              type="file"
              accept="image/*"
              disabled={isPending}
              className="cursor-pointer file:text-indigo-600 file:bg-indigo-50 file:rounded-md file:border-0 file:px-3 file:py-1 file:mr-3 h-11 py-2"
            />
            <p className="text-[11px] text-zinc-500 font-medium mt-1">Upload a new image to replace the current logo.</p>
            <input type="hidden" name="logo_url" value={org.logo_url || ''} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Affiliation / Board</Label>
              {affiliationMode === 'select' ? (
                <Select 
                  name="affiliation" 
                  defaultValue={initialAffiliationMode === 'select' ? (org.affiliation || undefined) : undefined}
                  disabled={isPending}
                  onValueChange={(val) => {
                    if (val === 'custom') {
                      setAffiliationMode('custom')
                    } else {
                      setAffiliationValue(val)
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Affiliation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBSE">CBSE</SelectItem>
                    <SelectItem value="ICSE">ICSE</SelectItem>
                    <SelectItem value="State Board">State Board</SelectItem>
                    <SelectItem value="custom" className="font-semibold text-indigo-600">
                      + Enter custom...
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <Input
                    placeholder="Enter custom affiliation..."
                    value={affiliationValue}
                    onChange={(e) => setAffiliationValue(e.target.value)}
                    disabled={isPending}
                    className="h-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setAffiliationMode('select')}
                    className="text-[10px] text-indigo-600 hover:underline font-medium uppercase tracking-wider text-left"
                  >
                    Select from existing
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="ef-course_type" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Course Type</Label>
              <Select name="course_type" defaultValue={org.course_type || undefined} disabled={isPending}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Course Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pre Primary">Pre Primary</SelectItem>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Middle School">Middle School</SelectItem>
                  <SelectItem value="Secondary School">Secondary School</SelectItem>
                  <SelectItem value="Senior Secondary School">Senior Secondary School</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="ef-session_start_date" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Session Start</Label>
              <Input
                type="date"
                id="ef-session_start_date"
                name="session_start_date"
                defaultValue={org.session_start_date ?? ''}
                disabled={isPending}
                className="h-10"
              />
            </div>
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="ef-session_end_date" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Session End</Label>
              <Input
                type="date"
                id="ef-session_end_date"
                name="session_end_date"
                defaultValue={org.session_end_date ?? ''}
                disabled={isPending}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="ef-email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Official Email</Label>
              <Input
                type="email"
                id="ef-email"
                name="email"
                defaultValue={org.email ?? ''}
                placeholder="contact@branch.com"
                disabled={isPending}
                className="h-10"
              />
            </div>
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="ef-phone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Official Phone</Label>
              <Input
                type="tel"
                id="ef-phone"
                name="phone"
                defaultValue={org.phone ?? ''}
                placeholder="+91 98765 43210"
                disabled={isPending}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
            <Label htmlFor="ef-address" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Address</Label>
            <Input
              id="ef-address"
              name="address"
              defaultValue={org.address ?? ''}
              placeholder="123 School Ave, City, State"
              disabled={isPending}
              className="h-10"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 font-medium">
              {error}
            </p>
          )}

          <div className="pt-6 border-t border-zinc-100 flex gap-3 justify-between items-center pb-4">
            <Button 
              type="button" 
              variant="ghost" 
              disabled={isPending}
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Delete Franchise
            </Button>
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button type="button" variant="outline" className="h-10 rounded-xl" disabled={isPending}>
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isPending} className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2 font-semibold">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
