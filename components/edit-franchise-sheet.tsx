'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Loader2 } from 'lucide-react'
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
import { updateOrganization } from '@/app/dashboard/actions'

interface Org {
  id: string
  name: string
  affiliation?: string | null
  course_type?: string | null
  session_start_date?: string | null
  session_end_date?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

interface EditFranchiseSheetProps {
  org: Org
}

export function EditFranchiseSheet({ org }: EditFranchiseSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 -mt-2 -mr-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Edit Franchise Settings</SheetTitle>
          <SheetDescription>
            Update the details for <span className="font-medium text-foreground">{org.name}</span>.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Franchise Name */}
          <div className="space-y-2">
            <Label htmlFor="ef-name">
              Franchise Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ef-name"
              name="name"
              required
              defaultValue={org.name}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ef-affiliation">Affiliation / Board</Label>
              <Input
                id="ef-affiliation"
                name="affiliation"
                defaultValue={org.affiliation ?? ''}
                placeholder="e.g. CBSE, ICSE"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ef-course_type">Course Type</Label>
              <select
                id="ef-course_type"
                name="course_type"
                defaultValue={org.course_type ?? 'Pre Primary'}
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
              <Label htmlFor="ef-session_start_date">Session Start</Label>
              <Input
                type="date"
                id="ef-session_start_date"
                name="session_start_date"
                defaultValue={org.session_start_date ?? ''}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ef-session_end_date">Session End</Label>
              <Input
                type="date"
                id="ef-session_end_date"
                name="session_end_date"
                defaultValue={org.session_end_date ?? ''}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ef-email">Official Email</Label>
              <Input
                type="email"
                id="ef-email"
                name="email"
                defaultValue={org.email ?? ''}
                placeholder="contact@branch.com"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ef-phone">Official Phone</Label>
              <Input
                type="tel"
                id="ef-phone"
                name="phone"
                defaultValue={org.phone ?? ''}
                placeholder="+91 98765 43210"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ef-address">Address</Label>
            <Input
              id="ef-address"
              name="address"
              defaultValue={org.address ?? ''}
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
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
