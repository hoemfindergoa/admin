'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createOrganization(formData)
        setOpen(false)
        formRef.current?.reset()
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
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Franchise
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Create New Franchise</SheetTitle>
          <SheetDescription>
            Enter the details for your new school branch. You can update these settings later.
          </SheetDescription>
        </SheetHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="sf-name">
              Franchise Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sf-name"
              name="name"
              required
              placeholder="e.g. Dheeraj Playschool - North Branch"
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sf-affiliation">Affiliation / Board</Label>
              <Input
                id="sf-affiliation"
                name="affiliation"
                placeholder="e.g. CBSE, ICSE"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-course_type">Course Type</Label>
              <select
                id="sf-course_type"
                name="course_type"
                disabled={isPending}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Pre Primary">Pre Primary</option>
                <option value="Primary">Primary</option>
                <option value="Middle School">Middle School</option>
                <option value="Secondary School">Secondary School</option>
                <option value="Senior Secondary School">Senior Secondary School</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sf-session_start_date">Session Start</Label>
              <Input
                type="date"
                id="sf-session_start_date"
                name="session_start_date"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-session_end_date">Session End</Label>
              <Input
                type="date"
                id="sf-session_end_date"
                name="session_end_date"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sf-email">Official Email</Label>
              <Input
                type="email"
                id="sf-email"
                name="email"
                placeholder="contact@branch.com"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sf-phone">Official Phone</Label>
              <Input
                type="tel"
                id="sf-phone"
                name="phone"
                placeholder="+91 98765 43210"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sf-address">Address</Label>
            <Input
              id="sf-address"
              name="address"
              placeholder="123 School Ave, City, State"
              disabled={isPending}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <SheetFooter className="pt-4 gap-3 flex-row justify-end border-t">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Creating…' : 'Create Franchise'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
