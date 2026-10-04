'use client'

import { FormEvent, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote, Search, Plus, CreditCard, Receipt, FileText, Users, Home, ArrowRight, ChevronRight, X, Filter, Download } from 'lucide-react'
import { recordFeePayment } from '@/app/dashboard/[orgId]/finance/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Student = { id: string; student_name: string; admission_number: string | null; class_id: string; section_id: string }
type Payment = { id: string; student_id: string; amount: number; payment_date: string; payment_method: string; reference_number: string | null; notes: string | null; recorded_by_email: string | null; for_month?: string | null; fee_structure_id?: string | null }
type Class = { id: string; name: string }

const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
const paymentMethods = [['CASH', 'Cash'], ['UPI', 'UPI'], ['BANK_TRANSFER', 'Bank transfer'], ['CARD', 'Card'], ['CHEQUE', 'Cheque'], ['DEMAND_DRAFT', 'Demand Draft'], ['OTHER', 'Other']]
function today() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function FeeWorkspace({ orgId, students = [], payments = [], classes = [], ledgerReady = true }: { orgId: string; students?: Student[]; payments?: Payment[]; classes?: Class[]; ledgerReady?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  
  // Sidebar Navigation
  const [activeTab, setActiveTab] = useState<'collect' | 'structures' | 'family' | 'group' | 'demand_draft'>('collect')
  
  // Collect Fee State
  const [searchQuery, setSearchQuery] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  
  // Structure Creation State
  const [structureFrequency, setStructureFrequency] = useState('MONTHLY')
  
  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students])
  
  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (classFilter !== 'all') {
      filtered = filtered.filter(s => s.class_id === classFilter);
    }
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.student_name.toLowerCase().includes(lower) || 
        (s.admission_number && s.admission_number.toLowerCase().includes(lower))
      );
    }
    return filtered;
  }, [students, searchQuery, classFilter]);

  function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedStudent) return
    const form = event.currentTarget
    const formData = new FormData(form)
    formData.append('student_id', selectedStudent.id)
    
    startTransition(async () => {
      try {
        await recordFeePayment(orgId, formData)
        form.reset()
        setSelectedStudent(null) // Close sheet on success
        toast.success('Payment recorded successfully.')
        router.refresh()
      } catch (cause) { 
        toast.error(cause instanceof Error ? cause.message : 'Could not save this record.')
      }
    })
  }

  // Calculate some dummy due info based on payments for the selected student
  const studentPayments = selectedStudent ? payments.filter(p => p.student_id === selectedStudent.id) : []

  return <div className="space-y-6 max-w-[1600px] mx-auto">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Fee Manager</h1>
        <p className="mt-1 text-[14px] font-medium text-zinc-500">Comprehensive fee management, collections, and structures.</p>
      </div>
    </div>
    
    {!ledgerReady && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] font-semibold text-amber-800 shadow-sm">Apply the financial ledger section in schema_school_management.sql and run schema_fees_update.sql before recording payments.</p>}
    
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1">
        <div className="mb-4 px-2"><h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fee Operations</h3></div>
        <button onClick={() => setActiveTab('collect')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'collect' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <Banknote className={cn("w-5 h-5", activeTab === 'collect' ? "text-indigo-600" : "text-zinc-400")} /> Collect Fee
        </button>
        <button onClick={() => setActiveTab('structures')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'structures' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <FileText className={cn("w-5 h-5", activeTab === 'structures' ? "text-indigo-600" : "text-zinc-400")} /> Fee Structures
        </button>
        <button onClick={() => setActiveTab('family')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'family' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <Home className={cn("w-5 h-5", activeTab === 'family' ? "text-indigo-600" : "text-zinc-400")} /> Family Mapping
        </button>
        <button onClick={() => setActiveTab('group')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'group' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <Users className={cn("w-5 h-5", activeTab === 'group' ? "text-indigo-600" : "text-zinc-400")} /> Group Discounts
        </button>
        <button onClick={() => setActiveTab('demand_draft')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'demand_draft' ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <Receipt className={cn("w-5 h-5", activeTab === 'demand_draft' ? "text-indigo-600" : "text-zinc-400")} /> Demand Drafts
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col relative">
        
        {/* VIEW: COLLECT FEE */}
        {activeTab === 'collect' && (
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><Banknote className="w-5 h-5 text-indigo-600" /> Collect Fee</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input placeholder="Search admission no, name..." className="pl-9 h-10 border-zinc-200" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <select className="h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                    <option value="all">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {filteredStudents.length === 0 ? (
                <div className="py-20 text-center text-zinc-400 flex flex-col items-center">
                  <Search className="w-12 h-12 mb-4 opacity-20" />
                  <p>No students found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map(student => {
                    const cls = classes.find(c => c.id === student.class_id)
                    return (
                      <div key={student.id} onClick={() => setSelectedStudent(student)} className="group border border-zinc-200 rounded-xl p-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer bg-white relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-bold text-zinc-900 group-hover:text-indigo-700 transition-colors">{student.student_name}</h4>
                            <p className="text-xs font-medium text-zinc-500 mt-0.5">#{student.admission_number || 'N/A'}</p>
                          </div>
                          <div className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                            {cls?.name || 'Class N/A'}
                          </div>
                        </div>
                        <div className="flex items-center text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                          Collect Fee <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW: FEE STRUCTURES */}
        {activeTab === 'structures' && (
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-600" /> Fee Structures</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid lg:grid-cols-[1fr_2fr] gap-6">
                
                {/* Form to Create Structure */}
                <Card className="rounded-xl border-zinc-200 shadow-sm h-fit">
                  <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                    <CardTitle className="text-base font-bold">Create New Structure</CardTitle>
                    <CardDescription className="text-xs">Define a new fee rule for the system.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-1.5"><Label className="text-[13px] font-bold text-zinc-900">Structure Title</Label><Input placeholder="e.g. Tuition Fee, Transport Fee" className="h-10 text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-[13px] font-bold text-zinc-900">Amount (₹)</Label><Input type="number" placeholder="0.00" className="h-10 text-sm" /></div>
                    <div className="space-y-1.5"><Label className="text-[13px] font-bold text-zinc-900">Target</Label><select className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm"><option>All Students</option><option>Specific Class</option><option>Family Discount</option><option>Group Discount</option></select></div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-bold text-zinc-900">Occurrence / Frequency</Label>
                      <select className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm" value={structureFrequency} onChange={e => setStructureFrequency(e.target.value)}>
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                        <option value="ONCE">One Time</option>
                      </select>
                    </div>
                    
                    {structureFrequency === 'MONTHLY' && (
                      <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 mt-2">
                        <div className="space-y-1.5">
                          <Label className="text-[12px] font-bold text-zinc-800">Start Date</Label>
                          <Input type="date" defaultValue={today()} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[12px] font-bold text-zinc-800">Start Month</Label>
                          <select className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs">
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <Button className="w-full h-10 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white mt-4">Save Structure</Button>
                  </CardContent>
                </Card>

                {/* List of Active Structures */}
                <Card className="rounded-xl border-zinc-200 shadow-sm h-fit">
                  <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
                    <CardTitle className="text-base font-bold">Active Fee Structures</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 text-center text-zinc-400">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No fee structures found. Create one to get started.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {/* OTHER VIEWS PLACEHOLDERS */}
        {(activeTab === 'family' || activeTab === 'group' || activeTab === 'demand_draft') && (
          <div className="flex flex-col h-full items-center justify-center p-10 text-center">
            {activeTab === 'family' && <Home className="w-16 h-16 text-zinc-200 mb-4" />}
            {activeTab === 'group' && <Users className="w-16 h-16 text-zinc-200 mb-4" />}
            {activeTab === 'demand_draft' && <Receipt className="w-16 h-16 text-zinc-200 mb-4" />}
            <h2 className="text-xl font-bold text-zinc-800 mb-2 capitalize">{activeTab.replace('_', ' ')} Module</h2>
            <p className="text-zinc-500 max-w-md">This section is part of the expanded ERP feature set and will be activated once the database relationships for {activeTab.replace('_', ' ')} are fully synchronized.</p>
          </div>
        )}
      </div>
    </div>

    {/* COLLECT FEE: RIGHT SIDE SHEET */}
    <Sheet open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-zinc-50 p-0 border-l border-zinc-200">
        {selectedStudent && (() => {
          const cls = classes.find(c => c.id === selectedStudent.class_id)
          return (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 bg-white border-b border-zinc-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">Fee Collection</div>
                    <SheetTitle className="text-2xl font-black text-zinc-900">{selectedStudent.student_name}</SheetTitle>
                    <SheetDescription className="text-sm font-medium mt-1">
                      Admission: #{selectedStudent.admission_number || 'N/A'} • {cls?.name || 'Class N/A'}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <form id="collect-fee-form" onSubmit={submitPayment} className="space-y-6">
                  {/* Ledger / Dues Summary (Mocked visual for ERP feel) */}
                  <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Account Summary</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                        <p className="text-xs font-semibold text-red-600 mb-1">Total Due</p>
                        <p className="text-lg font-black text-red-700">₹0.00</p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <p className="text-xs font-semibold text-emerald-600 mb-1">Total Paid</p>
                        <p className="text-lg font-black text-emerald-700">{money(studentPayments.reduce((acc, curr) => acc + curr.amount, 0))}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-900 border-b border-zinc-200 pb-2">Record New Payment</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="for_month" className="text-xs font-bold text-zinc-700">For Month <span className="text-red-500">*</span></Label>
                        <select id="for_month" name="for_month" required className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                          <option value="">Select Month...</option>
                          {MONTHS.map((m, i) => <option key={m} value={`${new Date().getFullYear()}-${String(i+1).padStart(2, '0')}`}>{m} {new Date().getFullYear()}</option>)}
                          <option value="arrears">Previous Arrears</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="amount" className="text-xs font-bold text-zinc-700">Amount (₹) <span className="text-red-500">*</span></Label>
                        <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" className="h-10 text-sm border-zinc-300 shadow-sm focus:ring-indigo-500" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="payment_date" className="text-xs font-bold text-zinc-700">Payment Date <span className="text-red-500">*</span></Label>
                        <Input id="payment_date" name="payment_date" type="date" required defaultValue={today()} className="h-10 text-sm border-zinc-300 shadow-sm focus:ring-indigo-500" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="payment_method" className="text-xs font-bold text-zinc-700">Method</Label>
                        <select id="payment_method" name="payment_method" className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                          {paymentMethods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="reference_number" className="text-xs font-bold text-zinc-700">Reference Number / DD No</Label>
                      <Input id="reference_number" name="reference_number" placeholder="Optional" className="h-10 text-sm border-zinc-300 shadow-sm focus:ring-indigo-500" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="notes" className="text-xs font-bold text-zinc-700">Remarks / Notes</Label>
                      <Input id="notes" name="notes" placeholder="Optional" className="h-10 text-sm border-zinc-300 shadow-sm focus:ring-indigo-500" />
                    </div>
                  </div>
                </form>
                
                {/* Recent Payments for this student */}
                {studentPayments.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-zinc-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Recent Payments</h4>
                    <div className="space-y-2">
                      {studentPayments.slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-zinc-200 shadow-sm">
                          <div>
                            <p className="font-bold text-zinc-900 text-sm">{money(p.amount)}</p>
                            <p className="text-[11px] font-medium text-zinc-500">{p.payment_date} • {p.payment_method.replace('_', ' ')} {p.for_month && `• For ${p.for_month}`}</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-indigo-600"><Download className="w-3 h-3 mr-1"/> Receipt</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6 bg-white border-t border-zinc-200">
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1 font-bold" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                  <Button type="submit" form="collect-fee-form" disabled={!ledgerReady || pending} className="flex-1 font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                    {pending ? 'Processing...' : 'Collect & Save'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </SheetContent>
    </Sheet>
  </div>
}
