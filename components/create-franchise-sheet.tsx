'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Store } from 'lucide-react'
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
import { createOrganization } from '@/app/dashboard/actions'

interface CreateFranchiseSheetProps {
  trigger?: React.ReactNode
}

export function CreateFranchiseSheet({ trigger }: CreateFranchiseSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [affiliationMode, setAffiliationMode] = useState<'select' | 'custom'>('select')
  const [affiliationValue, setAffiliationValue] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    // Ensure affiliation is properly set
    if (affiliationMode === 'custom') {
      formData.set('affiliation', affiliationValue)
    }

    startTransition(async () => {
      try {
        await createOrganization(formData)
        setOpen(false)
        formRef.current?.reset()
        setAffiliationValue('')
        setAffiliationMode('select')
        router.refresh()
      } catch (err: any) {
        setError(err?.message ?? 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold rounded-lg h-10 px-4">
            <Plus className="w-4 h-4" />
            Create Franchise
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto bg-zinc-50 p-0 flex flex-col">
        <SheetHeader className="p-6 bg-white border-b border-zinc-100 shrink-0">
          <SheetTitle className="text-xl flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-600" />
            Create New Franchise
          </SheetTitle>
          <SheetDescription>
            Enter the details for your new school branch. You can update these settings later.
          </SheetDescription>
        </SheetHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
            <Label htmlFor="sf-name" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Franchise Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="sf-name"
              name="name"
              required
              placeholder="e.g. Dheeraj Playschool - North Branch"
              disabled={isPending}
              className="h-10"
            />
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
            <Label htmlFor="sf-franchise_brand" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Franchise Brand
            </Label>
            <Select name="franchise_brand" disabled={isPending}>
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
            <Label htmlFor="sf-logo" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Franchise Logo
            </Label>
            <Input
              id="sf-logo"
              name="logo_file"
              type="file"
              accept="image/*"
              disabled={isPending}
              className="cursor-pointer file:text-indigo-600 file:bg-indigo-50 file:rounded-md file:border-0 file:px-3 file:py-1 file:mr-3 h-11 py-2"
            />
            <p className="text-[11px] text-zinc-500 font-medium mt-1">Upload a square image (PNG/JPG) for best results.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Affiliation / Board</Label>
              {affiliationMode === 'select' ? (
                <Select 
                  name="affiliation" 
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
              <Label htmlFor="sf-course_type" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Course Type</Label>
              <Select name="course_type" disabled={isPending}>
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
              <Label htmlFor="sf-session_start_date" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Session Start</Label>
              <Input
                type="date"
                id="sf-session_start_date"
                name="session_start_date"
                disabled={isPending}
                className="h-10"
              />
            </div>
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="sf-session_end_date" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Session End</Label>
              <Input
                type="date"
                id="sf-session_end_date"
                name="session_end_date"
                disabled={isPending}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="sf-email" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Official Email</Label>
              <Input
                type="email"
                id="sf-email"
                name="email"
                placeholder="contact@branch.com"
                disabled={isPending}
                className="h-10"
              />
            </div>
            <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
              <Label htmlFor="sf-phone" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Official Phone</Label>
              <Input
                type="tel"
                id="sf-phone"
                name="phone"
                placeholder="+91 98765 43210"
                disabled={isPending}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm">
            <Label htmlFor="sf-address" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Address</Label>
            <Input
              id="sf-address"
              name="address"
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

          <div className="pt-6 border-t border-zinc-100 flex gap-3 justify-end pb-4">
            <SheetClose asChild>
              <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={isPending}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isPending} className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2 font-semibold">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Creating…' : 'Create Franchise'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
