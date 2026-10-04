'use client'

import { useState } from 'react'
import { Plus, Building, Users, User, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createHostel } from '@/app/dashboard/[orgId]/hostel/actions'

type Hostel = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  warden_name?: string;
  warden_phone?: string;
  address?: string;
}

import { toast } from 'sonner'

export function HostelWorkspace({ orgId, hostels = [] }: { orgId: string; hostels?: Hostel[] }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      await createHostel(orgId, formData)
      setOpen(false)
      toast.success('Hostel added successfully.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to add hostel. Ensure database tables exist.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Hostel Management</h1>
          <p className="mt-1 text-[14px] font-medium text-zinc-500">Manage hostels, capacities, and wardens for your franchise.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setOpen(true)} className="shadow-sm text-[13px] font-semibold h-10 bg-pink-600 hover:bg-pink-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Hostel
          </Button>
        </div>
      </div>

      {!hostels.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-4 ring-1 ring-pink-100">
            <Building className="h-8 w-8 text-pink-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">No hostels added yet</h3>
          <p className="mt-2 max-w-md text-[14px] text-zinc-500 font-medium">Add a hostel to manage rooms, assign wardens, and handle student accommodation.</p>
          <Button onClick={() => setOpen(true)} className="mt-6 shadow-sm font-semibold bg-pink-600 hover:bg-pink-700">
            <Plus className="mr-2 h-4 w-4" /> Add your first hostel
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hostels.map(hostel => (
            <div key={hostel.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col transition-all hover:border-pink-300 hover:shadow-md">
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-100 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 ring-1 ring-pink-200/50">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg leading-tight">{hostel.name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${hostel.type === 'Boys' ? 'bg-blue-50 text-blue-700' : hostel.type === 'Girls' ? 'bg-pink-50 text-pink-700' : 'bg-purple-50 text-purple-700'}`}>
                    {hostel.type} Hostel
                  </span>
                </div>
              </div>
              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-700">Capacity</p>
                    <p className="text-[13px] font-medium text-zinc-500">{hostel.capacity} beds</p>
                  </div>
                </div>

                {(hostel.warden_name || hostel.warden_phone) && (
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-700">Warden</p>
                      {hostel.warden_name && <p className="text-[13px] font-medium text-zinc-500">{hostel.warden_name}</p>}
                      {hostel.warden_phone && <p className="text-[12px] font-medium text-zinc-400 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {hostel.warden_phone}</p>}
                    </div>
                  </div>
                )}

                {hostel.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-zinc-700">Location</p>
                      <p className="text-[13px] font-medium text-zinc-500 line-clamp-2">{hostel.address}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full justify-center h-9 text-[13px] font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                  Manage Rooms
                </Button>
                <Button variant="outline" className="w-full justify-center h-9 text-[13px] font-semibold border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                  View Students
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
              <SheetTitle className="text-xl font-bold">Add New Hostel</SheetTitle>
              <SheetDescription className="text-[13px] font-medium text-zinc-500">Create a new hostel block for this franchise.</SheetDescription>
            </SheetHeader>
          </div>
          <form onSubmit={handleCreate} className="px-6 py-8 space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="text-[13px] font-bold text-zinc-900">Hostel Name <span className="text-red-500">*</span></Label>
                  <Input
                    name="name"
                    required
                    placeholder="e.g. Ganga Block"
                    className="h-10 font-medium"
                  />
                </div>

                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="text-[13px] font-bold text-zinc-900">Type <span className="text-red-500">*</span></Label>
                  <Select name="type" required defaultValue="Boys">
                    <SelectTrigger className="h-10 font-medium">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boys">Boys</SelectItem>
                      <SelectItem value="Girls">Girls</SelectItem>
                      <SelectItem value="Co-ed">Co-ed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-bold text-zinc-900">Total Capacity (Beds) <span className="text-red-500">*</span></Label>
                <Input
                  name="capacity"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 150"
                  className="h-10 font-medium"
                />
              </div>

              <div className="pt-4 border-t border-zinc-100">
                <h3 className="font-bold text-zinc-900 mb-4">Warden Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-[13px] font-bold text-zinc-900">Warden Name</Label>
                    <Input
                      name="warden_name"
                      placeholder="e.g. John Doe"
                      className="h-10 font-medium"
                    />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-[13px] font-bold text-zinc-900">Warden Phone</Label>
                    <Input
                      name="warden_phone"
                      placeholder="e.g. +91 9876543210"
                      className="h-10 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-[13px] font-bold text-zinc-900">Hostel Address / Location</Label>
                <Input
                  name="address"
                  placeholder="e.g. North Campus, Behind Main Building"
                  className="h-10 font-medium"
                />
              </div>
            </div>

            <div className="sticky bottom-0 -mx-6 -mb-8 px-6 py-4 bg-white border-t border-zinc-100 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-semibold text-zinc-600" disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="font-semibold bg-pink-600 hover:bg-pink-700">
                {isSubmitting ? 'Saving...' : 'Add Hostel'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
