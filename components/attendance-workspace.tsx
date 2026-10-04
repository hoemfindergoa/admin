'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CalendarCheck, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { saveAttendance } from '@/app/dashboard/[orgId]/attendance/actions'

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'

export function AttendanceWorkspace({ orgId, classes, sections, students, attendance, date, classId, sectionId }: any) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // Local state for the filter form
  const [filterDate, setFilterDate] = useState(date)
  const [filterClass, setFilterClass] = useState(classId || '')
  const [filterSection, setFilterSection] = useState(sectionId || '')

  // Local state for attendance edits
  const [attendanceState, setAttendanceState] = useState<Record<string, { status: AttendanceStatus, notes: string }>>({})

  // Initialize attendance state when data loads
  useEffect(() => {
    const newState: Record<string, { status: AttendanceStatus, notes: string }> = {}

    // Set defaults (PRESENT) for all students
    students.forEach((s: any) => {
      newState[s.id] = { status: 'PRESENT', notes: '' }
    })

    // Override with saved data
    attendance.forEach((a: any) => {
      if (newState[a.student_id]) {
        newState[a.student_id] = { status: a.status as AttendanceStatus, notes: a.notes || '' }
      }
    })

    setAttendanceState(newState)
  }, [students, attendance])

  function updateFilters() {
    const params = new URLSearchParams()
    if (filterDate) params.set('date', filterDate)
    if (filterClass) params.set('classId', filterClass)
    if (filterSection) params.set('sectionId', filterSection)
    router.push(`/dashboard/${orgId}/attendance?${params.toString()}`)
  }

  function handleSave() {
    if (!classId || !sectionId) {
      toast.error('Select a class and section first.')
      return
    }

    const payload = Object.entries(attendanceState).map(([studentId, data]) => ({
      student_id: studentId,
      status: data.status,
      notes: data.notes
    }))

    startTransition(async () => {
      try {
        await saveAttendance(orgId, classId, sectionId, date, payload)
        toast.success('Attendance saved successfully!')
      } catch (error: any) {
        toast.error(error.message || 'Failed to save attendance.')
      }
    })
  }

  function markAll(status: AttendanceStatus) {
    const newState = { ...attendanceState }
    Object.keys(newState).forEach(id => {
      newState[id]!.status = status
    })
    setAttendanceState(newState)
  }

  const activeSections = sections.filter((s: any) => s.class_id === filterClass)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Attendance Manager</h1>
          <p className="mt-1 text-[14px] font-medium text-zinc-500">Record daily student attendance easily.</p>
        </div>
      </div>

      <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden h-fit bg-white">
        <CardHeader className="border-b border-zinc-100 px-6 py-5 bg-teal-50/50">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <div className="h-8 w-8 rounded-xl bg-teal-100 flex items-center justify-center ring-1 ring-teal-200">
              <CalendarIcon className="h-4 w-4 text-teal-600" />
            </div>
            Filter Register
          </CardTitle>
          <CardDescription className="text-[13px] font-medium text-zinc-500">Select the date, class, and section to view or update attendance.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1">
              <Label className="text-[13px] font-bold text-zinc-900">Date</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm"
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-[13px] font-bold text-zinc-900">Class</Label>
              <select
                value={filterClass}
                onChange={e => { setFilterClass(e.target.value); setFilterSection(''); }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-[13px] font-bold text-zinc-900">Section</Label>
              <select
                value={filterSection}
                onChange={e => setFilterSection(e.target.value)}
                disabled={!filterClass}
                className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              >
                <option value="">Select section</option>
                {activeSections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Button onClick={updateFilters} className="h-10 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8">
              Load Register
            </Button>
          </div>
        </CardContent>
      </Card>

      {classId && sectionId && (
        <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden h-fit bg-white">
          <CardHeader className="border-b border-zinc-100 px-6 py-5 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-zinc-900">
                Register for {classes.find((c: any) => c.id === classId)?.name} - Section {sections.find((s: any) => s.id === sectionId)?.name}
              </CardTitle>
              <CardDescription className="text-[13px] font-medium text-zinc-500">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </div>
            {students.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-[12px] h-8">All Present</Button>
                <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')} className="text-rose-600 border-rose-200 hover:bg-rose-50 text-[12px] h-8">All Absent</Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <CalendarCheck className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">No students found</h3>
                <p className="text-[13px] text-zinc-500 mt-1 max-w-sm">There are no students assigned to this class and section yet. Add students first to mark attendance.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-zinc-50 border-b border-zinc-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-bold text-zinc-500 uppercase tracking-wider">Notes (Optional)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {students.map((student: any) => {
                      const state = attendanceState[student.id] || { status: 'PRESENT', notes: '' }

                      return (
                        <tr key={student.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-zinc-900">{student.student_name}</div>
                            <div className="text-[11px] font-medium text-zinc-500 mt-0.5">Adm: {student.admission_number || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: { ...state, status: 'PRESENT' } }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[11px] transition-colors ${state.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Present
                              </button>
                              <button
                                onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: { ...state, status: 'ABSENT' } }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[11px] transition-colors ${state.status === 'ABSENT' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                              >
                                <XCircle className="h-3.5 w-3.5" /> Absent
                              </button>
                              <button
                                onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: { ...state, status: 'LATE' } }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[11px] transition-colors ${state.status === 'LATE' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                              >
                                <Clock className="h-3.5 w-3.5" /> Late
                              </button>
                              <button
                                onClick={() => setAttendanceState(prev => ({ ...prev, [student.id]: { ...state, status: 'HALF_DAY' } }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-[11px] transition-colors ${state.status === 'HALF_DAY' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                              >
                                <AlertCircle className="h-3.5 w-3.5" /> Half Day
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              value={state.notes}
                              onChange={e => setAttendanceState(prev => ({ ...prev, [student.id]: { ...state, notes: e.target.value } }))}
                              placeholder="Reason for absence, etc."
                              className="h-9 text-[12px] border-zinc-200 shadow-sm"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {students.length > 0 && (
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end">
              <Button onClick={handleSave} disabled={pending} className="h-10 px-8 bg-teal-600 hover:bg-teal-700 text-white font-bold">
                {pending ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
