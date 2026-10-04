'use client'

import { FormEvent, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote, Receipt } from 'lucide-react'
import { recordExpense, recordFeePayment } from '@/app/dashboard/[orgId]/finance/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Student = { id: string; student_name: string; admission_number: string | null; class_id: string; section_id: string }
type Payment = { id: string; student_id: string; amount: number; payment_date: string; payment_method: string; reference_number: string | null; notes: string | null; recorded_by_email: string | null }
type Expense = { id: string; title: string; category: string; amount: number; expense_date: string; payment_method: string; vendor: string | null; reference_number: string | null; notes: string | null; recorded_by_email: string | null }

const money = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)
const paymentMethods = [['CASH', 'Cash'], ['UPI', 'UPI'], ['BANK_TRANSFER', 'Bank transfer'], ['CARD', 'Card'], ['CHEQUE', 'Cheque'], ['OTHER', 'Other']]
function today() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }

import { toast } from 'sonner'

export function FinancialWorkspace({ orgId, kind, students = [], payments = [], expenses = [], ledgerReady = true }: { orgId: string; kind: 'fees' | 'expenses'; students?: Student[]; payments?: Payment[]; expenses?: Expense[]; ledgerReady?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [studentId, setStudentId] = useState('')
  const isFees = kind === 'fees'
  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students])
  const paymentTotal = payments.reduce((sum, item) => sum + Number(item.amount), 0)
  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const monthStart = today().slice(0, 7)
  const monthTotal = isFees
    ? payments.filter((item) => item.payment_date.startsWith(monthStart)).reduce((sum, item) => sum + Number(item.amount), 0)
    : expenses.filter((item) => item.expense_date.startsWith(monthStart)).reduce((sum, item) => sum + Number(item.amount), 0)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    
    if (isFees && !studentId) {
      toast.error('Please select a valid student from the list.')
      return
    }
    
    startTransition(async () => {
      try {
        if (isFees) await recordFeePayment(orgId, formData)
        else await recordExpense(orgId, formData)
        form.reset()
        if (isFees) setStudentId('')
        toast.success(isFees ? 'Payment recorded successfully.' : 'Expense recorded successfully.')
        router.refresh()
      } catch (cause) { 
        toast.error(cause instanceof Error ? cause.message : 'Could not save this record.')
      }
    })
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{isFees ? 'Fee Manager' : 'Expense Manager'}</h1>
        <p className="mt-1 text-[14px] font-medium text-zinc-500">{isFees ? 'Record collected student payments and see confirmed revenue.' : 'Track school spending by date and category.'}</p>
      </div>
    </div>
    
    {!ledgerReady && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] font-semibold text-amber-800 shadow-sm">Apply the financial ledger section in schema_school_management.sql before recording payments or expenses.</p>}
    
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="rounded-2xl border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardDescription className="text-[13px] font-bold text-zinc-500 uppercase tracking-wider">{isFees ? 'Collected all time' : 'Expenses all time'}</CardDescription>
          <CardTitle className="text-3xl font-black text-zinc-900">{money(isFees ? paymentTotal : expenseTotal)}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="rounded-2xl border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardDescription className="text-[13px] font-bold text-zinc-500 uppercase tracking-wider">{isFees ? 'Collected this month' : 'Spent this month'}</CardDescription>
          <CardTitle className="text-3xl font-black text-emerald-600">{money(monthTotal)}</CardTitle>
        </CardHeader>
      </Card>
    </div>
    
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,1fr)_minmax(0,1.25fr)]">
      <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden h-fit">
        <CardHeader className={`border-b border-zinc-100 px-6 py-5 ${isFees ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            {isFees ? <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center ring-1 ring-emerald-200"><Banknote className="h-4 w-4 text-emerald-600" /></div> : <div className="h-8 w-8 rounded-xl bg-rose-100 flex items-center justify-center ring-1 ring-rose-200"><Receipt className="h-4 w-4 text-rose-600" /></div>}
            {isFees ? 'Record Payment' : 'Add Expense'}
          </CardTitle>
          <CardDescription className="text-[13px] font-medium text-zinc-500">{isFees ? 'Only saved payment records count as collected revenue.' : 'Add a school expense to the ledger.'}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <form onSubmit={submit} className="space-y-5">
            {isFees ? (
              <div className="space-y-1.5">
                <Label htmlFor="student_search" className="text-[13px] font-bold text-zinc-900">Search Student <span className="text-red-500">*</span></Label>
                <Input 
                  id="student_search" 
                  type="text" 
                  list="student_list" 
                  placeholder="Search by name or admission no..." 
                  className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm"
                  onChange={(e) => {
                    const val = e.target.value;
                    const matched = students.find(s => `${s.student_name} (${s.admission_number || 'N/A'})` === val);
                    setStudentId(matched?.id || '');
                  }}
                  required
                />
                <datalist id="student_list">
                  {students.map(student => (
                    <option key={student.id} value={`${student.student_name} (${student.admission_number || 'N/A'})`} />
                  ))}
                </datalist>
                <input type="hidden" name="student_id" value={studentId} />
              </div>
            ) : <>
              <div className="space-y-1.5"><Label htmlFor="title" className="text-[13px] font-bold text-zinc-900">Expense name <span className="text-red-500">*</span></Label><Input id="title" name="title" required placeholder="e.g. Classroom supplies" className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm" /></div>
              <div className="space-y-1.5"><Label htmlFor="category" className="text-[13px] font-bold text-zinc-900">Category <span className="text-red-500">*</span></Label><select id="category" name="category" required className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"><option value="">Select category…</option>{['Salary', 'Rent', 'Utilities', 'Supplies', 'Maintenance', 'Transport', 'Food', 'Other'].map((name) => <option key={name}>{name}</option>)}</select></div>
            </>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="amount" className="text-[13px] font-bold text-zinc-900">Amount (₹) <span className="text-red-500">*</span></Label><Input id="amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm" /></div>
              <div className="space-y-1.5"><Label htmlFor={isFees ? 'payment_date' : 'expense_date'} className="text-[13px] font-bold text-zinc-900">{isFees ? 'Payment date' : 'Expense date'} <span className="text-red-500">*</span></Label><Input id={isFees ? 'payment_date' : 'expense_date'} name={isFees ? 'payment_date' : 'expense_date'} type="date" required defaultValue={today()} className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm" /></div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="payment_method" className="text-[13px] font-bold text-zinc-900">Payment method</Label><select id="payment_method" name="payment_method" className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] font-medium ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2">{paymentMethods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            {!isFees && <div className="space-y-1.5"><Label htmlFor="vendor" className="text-[13px] font-bold text-zinc-900">Vendor / paid to</Label><Input id="vendor" name="vendor" placeholder="Optional" className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm" /></div>}
            <div className="space-y-1.5"><Label htmlFor="reference_number" className="text-[13px] font-bold text-zinc-900">Reference number</Label><Input id="reference_number" name="reference_number" placeholder="Receipt, UPI or cheque reference" className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm" /></div>
            <div className="space-y-1.5"><Label htmlFor="notes" className="text-[13px] font-bold text-zinc-900">Notes</Label><Input id="notes" name="notes" placeholder="Optional details" className="h-10 text-[13px] font-medium border-zinc-200 shadow-sm" /></div>
            <Button disabled={!ledgerReady || pending || (isFees && students.length === 0)} className={`w-full h-10 text-[13px] font-bold ${isFees ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}`}>{pending ? 'Saving…' : isFees ? 'Record payment' : 'Save expense'}</Button>
            {isFees && students.length === 0 && <p className="text-[13px] font-medium text-zinc-500">Add students before recording payments.</p>}
          </form>
        </CardContent>
      </Card>
      
      <Card className="rounded-2xl border-zinc-200 shadow-sm overflow-hidden h-fit">
        <CardHeader className="border-b border-zinc-100 px-6 py-5 bg-zinc-50/50">
          <CardTitle className="text-lg font-bold text-zinc-900">{isFees ? 'Recent payments' : 'Recent expenses'}</CardTitle>
          <CardDescription className="text-[13px] font-medium text-zinc-500">{isFees ? `${payments.length} recorded payments` : `${expenses.length} recorded expenses`}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isFees ? payments.length === 0 ? <p className="p-8 text-center text-[13px] font-medium text-zinc-500">No payments recorded yet.</p> : <div className="max-h-[600px] overflow-auto"><table className="w-full text-[13px]"><thead className="sticky top-0 bg-zinc-50 border-b border-zinc-100 shadow-sm"><tr><th className="p-4 text-left font-bold text-zinc-500 uppercase tracking-wider">Date / Student</th><th className="p-4 text-left font-bold text-zinc-500 uppercase tracking-wider">Method</th><th className="p-4 text-right font-bold text-zinc-500 uppercase tracking-wider">Amount</th></tr></thead><tbody className="divide-y divide-zinc-100">{payments.map((payment) => <tr key={payment.id} className="hover:bg-zinc-50/50 transition-colors"><td className="p-4"><div className="font-bold text-zinc-900">{studentById.get(payment.student_id)?.student_name ?? 'Student'}</div><div className="text-[12px] font-medium text-zinc-500 mt-0.5">{payment.payment_date}{payment.reference_number ? ` · ${payment.reference_number}` : ''}</div></td><td className="p-4"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide bg-zinc-100 text-zinc-600 border border-zinc-200">{payment.payment_method.replace('_', ' ')}</span></td><td className="p-4 text-right font-black text-emerald-600">{money(Number(payment.amount))}</td></tr>)}</tbody></table></div>
            : expenses.length === 0 ? <p className="p-8 text-center text-[13px] font-medium text-zinc-500">No expenses recorded yet.</p> : <div className="max-h-[600px] overflow-auto"><table className="w-full text-[13px]"><thead className="sticky top-0 bg-zinc-50 border-b border-zinc-100 shadow-sm"><tr><th className="p-4 text-left font-bold text-zinc-500 uppercase tracking-wider">Expense</th><th className="p-4 text-left font-bold text-zinc-500 uppercase tracking-wider">Date / Category</th><th className="p-4 text-right font-bold text-zinc-500 uppercase tracking-wider">Amount</th></tr></thead><tbody className="divide-y divide-zinc-100">{expenses.map((expense) => <tr key={expense.id} className="hover:bg-zinc-50/50 transition-colors"><td className="p-4"><div className="font-bold text-zinc-900">{expense.title}</div><div className="text-[12px] font-medium text-zinc-500 mt-0.5">{expense.vendor || expense.recorded_by_email || '—'}</div></td><td className="p-4"><div className="font-bold text-zinc-700">{expense.expense_date}</div><div className="mt-1"><span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-100">{expense.category}</span></div></td><td className="p-4 text-right font-black text-zinc-900">{money(Number(expense.amount))}</td></tr>)}</tbody></table></div>}
        </CardContent>
      </Card>
    </div>
  </div>
}
