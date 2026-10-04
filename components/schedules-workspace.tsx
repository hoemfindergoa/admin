'use client'

import { useState, useTransition, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Clock, Plus, Filter, MoreVertical, BookOpen, Coffee, X, CalendarCheck, Flag, Edit, Trash2 } from 'lucide-react'
import { createEvent, updateEvent, deleteEvent, addTimetableSlot, deleteTimetableSlot } from '@/app/dashboard/[orgId]/schedules/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Class = { id: string; name: string }
type Section = { id: string; class_id: string; name: string }
type Subject = { id: string; class_id: string; name: string; color_code: string | null }

type Event = {
  id: string
  title: string
  scope: string
  start_date: string
  end_date: string
  is_full_day: boolean
  is_recurring: boolean
  event_type: string
  class_id?: string | null
  section_id?: string | null
}

type TimetableSlot = {
  id: string
  class_id: string
  section_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_type: string
  subject_id: string | null
  label: string | null
}

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
]

export function SchedulesWorkspace({ 
  orgId, events = [], slots = [], classes = [], sections = [], subjects = [], schemaReady = true 
}: { 
  orgId: string; events?: Event[]; slots?: TimetableSlot[]; classes?: Class[]; sections?: Section[]; subjects?: Subject[]; schemaReady?: boolean 
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  
  // Tabs: 'calendar' | 'timetable'
  const [activeTab, setActiveTab] = useState<'calendar' | 'timetable'>('calendar')
  
  // Create/Edit Event State
  const [showEventSheet, setShowEventSheet] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventScope, setEventScope] = useState('ALL')
  
  // Timetable State
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '')
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections.find(s => s.class_id === (classes[0]?.id || ''))?.id || '')
  
  // Slot Dialog State
  const [activeDaySlot, setActiveDaySlot] = useState<number | null>(null)
  const [slotType, setSlotType] = useState('SUBJECT')

  function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    
    startTransition(async () => {
      try {
        if (editingEvent) {
          await updateEvent(orgId, editingEvent.id, formData)
          toast.success('Event updated successfully.')
        } else {
          await createEvent(orgId, formData)
          toast.success('Event scheduled successfully.')
        }
        form.reset()
        setShowEventSheet(false)
        setEditingEvent(null)
        router.refresh()
      } catch (cause) { 
        toast.error(cause instanceof Error ? cause.message : 'Could not save event.')
      }
    })
  }

  function handleDeleteEvent(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) return
    startTransition(async () => {
      try {
        await deleteEvent(orgId, eventId)
        toast.success('Event deleted.')
        router.refresh()
      } catch (cause) {
        toast.error('Could not delete event.')
      }
    })
  }

  function handleAddSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (activeDaySlot === null) return
    const form = event.currentTarget
    const formData = new FormData(form)
    
    startTransition(async () => {
      try {
        await addTimetableSlot(orgId, {
          class_id: selectedClassId,
          section_id: selectedSectionId,
          day_of_week: activeDaySlot,
          start_time: formData.get('start_time'),
          end_time: formData.get('end_time'),
          slot_type: formData.get('slot_type'),
          subject_id: formData.get('subject_id'),
          label: formData.get('label')
        })
        form.reset()
        setActiveDaySlot(null)
        toast.success('Slot added to timetable.')
        router.refresh()
      } catch (cause) { 
        toast.error(cause instanceof Error ? cause.message : 'Could not add slot.')
      }
    })
  }
  
  function handleDeleteSlot(slotId: string) {
    startTransition(async () => {
      try {
        await deleteTimetableSlot(orgId, slotId)
        toast.success('Slot removed.')
        router.refresh()
      } catch (cause) {
        toast.error('Could not remove slot.')
      }
    })
  }

  // Filter sections and subjects based on selected class
  const filteredSections = sections.filter(s => s.class_id === selectedClassId)
  const filteredSubjects = subjects.filter(s => s.class_id === selectedClassId)
  
  // Filter slots for current view
  const currentSlots = slots.filter(s => s.class_id === selectedClassId && s.section_id === selectedSectionId)

  return <div className="space-y-6 max-w-[1600px] mx-auto">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Schedules & Timetables</h1>
        <p className="mt-1 text-[14px] font-medium text-zinc-500">Manage school events, calendars, and class timetables.</p>
      </div>
    </div>
    
    {!schemaReady && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] font-semibold text-amber-800 shadow-sm">Please run schema_schedules_update.sql in your Supabase SQL editor to enable the Schedules tables.</p>}
    
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1">
        <div className="mb-4 px-2"><h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Scheduling Ops</h3></div>
        
        <button onClick={() => setActiveTab('calendar')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'calendar' ? "bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <CalendarIcon className={cn("w-5 h-5", activeTab === 'calendar' ? "text-cyan-600" : "text-zinc-400")} /> Events & Calendar
        </button>
        
        <button onClick={() => setActiveTab('timetable')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'timetable' ? "bg-cyan-50 text-cyan-700 shadow-sm border border-cyan-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <Clock className={cn("w-5 h-5", activeTab === 'timetable' ? "text-cyan-600" : "text-zinc-400")} /> Class Timetables
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col relative">
        
        {/* CALENDAR & EVENTS TAB */}
        {activeTab === 'calendar' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-cyan-600" /> School Calendar</h2>
              <Button onClick={() => setShowEventSheet(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-9 shadow-sm">
                <Plus className="w-4 h-4 mr-1" /> Create Event
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {events.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 flex flex-col items-center">
                  <CalendarCheck className="w-12 h-12 mb-4 opacity-20" />
                  <p>No upcoming events scheduled.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map(event => (
                    <div key={event.id} className="flex gap-4 p-4 border border-zinc-200 rounded-xl hover:border-cyan-200 transition-colors bg-white group relative">
                      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-cyan-600" onClick={() => { setEditingEvent(event); setEventScope(event.scope); setShowEventSheet(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-cyan-50 text-cyan-700 flex-shrink-0">
                        <span className="text-[10px] font-bold uppercase">{new Date(event.start_date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-black leading-none">{new Date(event.start_date).getDate()}</span>
                      </div>
                      <div className="flex-1 pr-20">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider", event.event_type === 'HOLIDAY' ? 'bg-red-100 text-red-700' : event.event_type === 'EXAM' ? 'bg-purple-100 text-purple-700' : 'bg-cyan-100 text-cyan-700')}>{event.event_type}</span>
                          {event.scope !== 'ALL' && <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{event.scope}</span>}
                        </div>
                        <h4 className="font-bold text-zinc-900 text-base">{event.title}</h4>
                        <p className="text-xs text-zinc-500 font-medium mt-0.5">
                          {event.is_full_day ? 'Full Day' : `${new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TIMETABLE TAB */}
        {activeTab === 'timetable' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><Clock className="w-5 h-5 text-cyan-600" /> Class Timetable</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-400" />
                <select 
                  className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium outline-none" 
                  value={selectedClassId} 
                  onChange={e => {
                    setSelectedClassId(e.target.value)
                    const firstSec = sections.find(s => s.class_id === e.target.value)
                    if(firstSec) setSelectedSectionId(firstSec.id)
                  }}
                >
                  <option value="" disabled>Select Class...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select 
                  className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium outline-none" 
                  value={selectedSectionId} 
                  onChange={e => setSelectedSectionId(e.target.value)}
                  disabled={!selectedClassId}
                >
                  {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto overflow-y-auto p-5 bg-zinc-50">
              {!selectedClassId || !selectedSectionId ? (
                <div className="py-20 text-center text-zinc-400">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Please select a class and section to view or edit the timetable.</p>
                </div>
              ) : (
                <div className="flex gap-4 min-w-max pb-10">
                  {DAYS.map(day => {
                    const daySlots = currentSlots.filter(s => s.day_of_week === day.id).sort((a,b) => a.start_time.localeCompare(b.start_time))
                    return (
                      <div key={day.id} className="w-64 flex-shrink-0 flex flex-col">
                        <div className="bg-white border border-zinc-200 rounded-t-xl py-3 px-4 text-center font-bold text-sm text-zinc-800 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400"></div>
                          {day.name}
                        </div>
                        <div className="bg-zinc-100/50 border-x border-b border-zinc-200 rounded-b-xl p-3 flex-1 min-h-[300px] flex flex-col gap-2 shadow-sm">
                          {daySlots.map(slot => (
                            <div key={slot.id} className="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm relative group hover:border-cyan-300 transition-colors">
                              <button onClick={() => handleDeleteSlot(slot.id)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <p className="text-[10px] font-bold text-zinc-400 mb-1">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</p>
                              
                              {slot.slot_type === 'SUBJECT' ? (
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 p-1 bg-indigo-50 text-indigo-600 rounded"><BookOpen className="w-3.5 h-3.5" /></div>
                                  <div>
                                    <p className="text-sm font-bold text-zinc-900">{subjects.find(s => s.id === slot.subject_id)?.name || 'Unknown'}</p>
                                  </div>
                                </div>
                              ) : slot.slot_type === 'BREAK' ? (
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 p-1 bg-amber-50 text-amber-600 rounded"><Coffee className="w-3.5 h-3.5" /></div>
                                  <div>
                                    <p className="text-sm font-bold text-zinc-900">{slot.label || 'Break'}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 p-1 bg-rose-50 text-rose-600 rounded"><Flag className="w-3.5 h-3.5" /></div>
                                  <div>
                                    <p className="text-sm font-bold text-zinc-900">{slot.label || 'Event'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <button onClick={() => setActiveDaySlot(day.id)} className="mt-2 w-full py-2 border-2 border-dashed border-zinc-300 rounded-lg text-xs font-bold text-zinc-400 hover:border-cyan-400 hover:text-cyan-600 transition-colors flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add Slot
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* CREATE EVENT RIGHT SIDE BAR (SHEET) */}
    <Sheet open={showEventSheet} onOpenChange={setShowEventSheet}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white p-0 border-l border-zinc-200">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 bg-zinc-50 border-b border-zinc-100">
            <SheetTitle className="text-xl font-bold text-zinc-900">{editingEvent ? 'Edit Event' : 'Schedule New Event'}</SheetTitle>
            <SheetDescription>{editingEvent ? 'Update the details for this event.' : 'Create an event, holiday, or exam for the calendar.'}</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 p-6">
            <form id="create-event-form" onSubmit={handleCreateEvent} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-700">Event Title <span className="text-red-500">*</span></Label>
                <Input name="title" required placeholder="e.g. Annual Sports Day" className="h-10" defaultValue={editingEvent?.title} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">Type</Label>
                  <select name="event_type" defaultValue={editingEvent?.event_type || 'EVENT'} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none">
                    <option value="EVENT">General Event</option>
                    <option value="HOLIDAY">Holiday</option>
                    <option value="EXAM">Exam / Test</option>
                    <option value="MEETING">Meeting</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">Scope</Label>
                  <select name="scope" value={eventScope} onChange={e => setEventScope(e.target.value)} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none">
                    <option value="ALL">School Wide</option>
                    <option value="CLASS">Specific Class</option>
                    <option value="SECTION">Specific Section</option>
                  </select>
                </div>
              </div>

              {eventScope === 'CLASS' || eventScope === 'SECTION' ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">Select Class <span className="text-red-500">*</span></Label>
                  <select name="class_id" required defaultValue={editingEvent?.class_id || ''} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none">
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">Start <span className="text-red-500">*</span></Label>
                  <Input type="datetime-local" name="start_date" required defaultValue={editingEvent ? new Date(editingEvent.start_date).toISOString().slice(0, 16) : ''} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-zinc-700">End <span className="text-red-500">*</span></Label>
                  <Input type="datetime-local" name="end_date" required defaultValue={editingEvent ? new Date(editingEvent.end_date).toISOString().slice(0, 16) : ''} className="h-10" />
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" name="is_full_day" defaultChecked={editingEvent?.is_full_day} className="w-4 h-4 rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500" />
                  Full Day Event
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" name="is_recurring" defaultChecked={editingEvent?.is_recurring} className="w-4 h-4 rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500" />
                  Repeats
                </label>
              </div>
            </form>
          </div>
          
          <div className="p-6 bg-white border-t border-zinc-200">
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setShowEventSheet(false)}>Cancel</Button>
              <Button type="submit" form="create-event-form" disabled={!schemaReady || pending} className="flex-1 font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm">
                {pending ? 'Saving...' : 'Schedule Event'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* ADD TIMETABLE SLOT DIALOG */}
    <Dialog open={activeDaySlot !== null} onOpenChange={(open) => !open && setActiveDaySlot(null)}>
      <DialogContent className="sm:max-w-sm p-6">
        <DialogHeader className="mb-4">
          <DialogTitle>Add Timetable Slot</DialogTitle>
          <DialogDescription>Assign a subject, break, or event to this day.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700">Slot Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setSlotType('SUBJECT')} className={cn("px-3 py-2 text-xs font-bold rounded border transition-colors", slotType === 'SUBJECT' ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-zinc-200 text-zinc-600")}>Subject</button>
              <button type="button" onClick={() => setSlotType('BREAK')} className={cn("px-3 py-2 text-xs font-bold rounded border transition-colors", slotType === 'BREAK' ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-zinc-200 text-zinc-600")}>Break</button>
              <button type="button" onClick={() => setSlotType('EVENT')} className={cn("px-3 py-2 text-xs font-bold rounded border transition-colors", slotType === 'EVENT' ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white border-zinc-200 text-zinc-600")}>Event</button>
            </div>
            <input type="hidden" name="slot_type" value={slotType} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700">Start Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="start_time" required className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700">End Time <span className="text-red-500">*</span></Label>
              <Input type="time" name="end_time" required className="h-9" />
            </div>
          </div>

          {slotType === 'SUBJECT' ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700">Subject <span className="text-red-500">*</span></Label>
              <select name="subject_id" required className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none">
                {filteredSubjects.length === 0 && <option value="" disabled>No subjects available in this class</option>}
                {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-700">Label <span className="text-red-500">*</span></Label>
              <Input name="label" required placeholder={slotType === 'BREAK' ? "e.g. Lunch Break" : "e.g. Assembly"} className="h-9" />
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={pending || (slotType === 'SUBJECT' && filteredSubjects.length === 0)} className="w-full font-bold bg-cyan-600 hover:bg-cyan-700">
              {pending ? 'Saving...' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

  </div>
}
