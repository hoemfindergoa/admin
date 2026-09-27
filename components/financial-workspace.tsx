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

export function FinancialWorkspace({ orgId, kind, students = [], payments = [], expenses = [], ledgerReady = true }: { orgId: string; kind: 'fees' | 'expenses'; students?: Student[]; payments?: Payment[]; expenses?: Expense[]; ledgerReady?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const isFees = kind === 'fees'
  const studentById = useMemo(() => new Map(students.map((student) => [student.id, student])), [students])
  const paymentTotal = payments.reduce((sum, item) => sum + Number(item.amount), 0)
  const expenseTotal = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const monthStart = today().slice(0, 7)
  const monthTotal = isFees
    ? payments.filter((item) => item.payment_date.startsWith(monthStart)).reduce((sum, item) => sum + Number(item.amount), 0)
    : expenses.filter((item) => item.expense_date.startsWith(monthStart)).reduce((sum, item) => sum + Number(item.amount), 0)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('')
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      try {
        if (isFees) await recordFeePayment(orgId, formData)
        else await recordExpense(orgId, formData)
        form.reset(); setNotice(isFees ? 'Payment recorded.' : 'Expense recorded.'); router.refresh()
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save this record.') }
    })
  }

  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold tracking-tight">{isFees ? 'Fee Manager' : 'Expense Manager'}</h1><p className="mt-1 text-muted-foreground">{isFees ? 'Record collected student payments and see confirmed revenue.' : 'Track school spending by date and category.'}</p></div>
    {!ledgerReady && <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Apply the financial ledger section in schema_school_management.sql before recording payments or expenses.</p>}
    <div className="grid gap-4 sm:grid-cols-2"><Card><CardHeader className="pb-2"><CardDescription>{isFees ? 'Collected all time' : 'Expenses all time'}</CardDescription><CardTitle>{money(isFees ? paymentTotal : expenseTotal)}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription>{isFees ? 'Collected this month' : 'Spent this month'}</CardDescription><CardTitle>{money(monthTotal)}</CardTitle></CardHeader></Card></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)]">
      <Card><CardHeader><CardTitle className="flex items-center gap-2">{isFees ? <Banknote className="h-5 w-5" /> : <Receipt className="h-5 w-5" />}{isFees ? 'Record payment' : 'Add expense'}</CardTitle><CardDescription>{isFees ? 'Only saved payment records count as collected revenue.' : 'Add a school expense to the ledger.'}</CardDescription></CardHeader><CardContent>
        <form onSubmit={submit} className="space-y-4">
          {isFees ? <div className="space-y-1.5"><Label htmlFor="student_id">Student</Label><select id="student_id" name="student_id" required className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select a student…</option>{students.map((student) => <option key={student.id} value={student.id}>{student.student_name}{student.admission_number ? ` · ${student.admission_number}` : ''}</option>)}</select></div> : <>
            <div className="space-y-1.5"><Label htmlFor="title">Expense name</Label><Input id="title" name="title" required placeholder="e.g. Classroom supplies" /></div>
            <div className="space-y-1.5"><Label htmlFor="category">Category</Label><select id="category" name="category" required className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">Select category…</option>{['Salary', 'Rent', 'Utilities', 'Supplies', 'Maintenance', 'Transport', 'Food', 'Other'].map((name) => <option key={name}>{name}</option>)}</select></div>
          </>}
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="amount">Amount (₹)</Label><Input id="amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></div><div className="space-y-1.5"><Label htmlFor={isFees ? 'payment_date' : 'expense_date'}>{isFees ? 'Payment date' : 'Expense date'}</Label><Input id={isFees ? 'payment_date' : 'expense_date'} name={isFees ? 'payment_date' : 'expense_date'} type="date" required defaultValue={today()} /></div></div>
          <div className="space-y-1.5"><Label htmlFor="payment_method">Payment method</Label><select id="payment_method" name="payment_method" className="h-10 w-full rounded-md border bg-background px-3 text-sm">{paymentMethods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          {!isFees && <div className="space-y-1.5"><Label htmlFor="vendor">Vendor / paid to</Label><Input id="vendor" name="vendor" placeholder="Optional" /></div>}
          <div className="space-y-1.5"><Label htmlFor="reference_number">Reference number</Label><Input id="reference_number" name="reference_number" placeholder="Receipt, UPI or cheque reference" /></div>
          <div className="space-y-1.5"><Label htmlFor="notes">Notes</Label><Input id="notes" name="notes" placeholder="Optional details" /></div>
          <Button disabled={!ledgerReady || pending || (isFees && students.length === 0)} className="w-full">{pending ? 'Saving…' : isFees ? 'Record payment' : 'Save expense'}</Button>
          {isFees && students.length === 0 && <p className="text-sm text-muted-foreground">Add students before recording payments.</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}{notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>{isFees ? 'Recent payments' : 'Recent expenses'}</CardTitle><CardDescription>{isFees ? `${payments.length} recorded payments` : `${expenses.length} recorded expenses`}</CardDescription></CardHeader><CardContent>
        {isFees ? payments.length === 0 ? <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No payments recorded yet.</p> : <div className="max-h-[560px] overflow-auto rounded-md border"><table className="w-full text-sm"><thead className="sticky top-0 bg-muted"><tr><th className="p-3 text-left">Date / student</th><th className="p-3 text-left">Method</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-t"><td className="p-3"><div className="font-medium">{studentById.get(payment.student_id)?.student_name ?? 'Student'}</div><div className="text-xs text-muted-foreground">{payment.payment_date}{payment.reference_number ? ` · ${payment.reference_number}` : ''}</div></td><td className="p-3">{payment.payment_method.replace('_', ' ')}</td><td className="p-3 text-right font-medium">{money(Number(payment.amount))}</td></tr>)}</tbody></table></div>
          : expenses.length === 0 ? <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No expenses recorded yet.</p> : <div className="max-h-[560px] overflow-auto rounded-md border"><table className="w-full text-sm"><thead className="sticky top-0 bg-muted"><tr><th className="p-3 text-left">Expense</th><th className="p-3 text-left">Date / category</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense.id} className="border-t"><td className="p-3"><div className="font-medium">{expense.title}</div><div className="text-xs text-muted-foreground">{expense.vendor || expense.recorded_by_email || '—'}</div></td><td className="p-3">{expense.expense_date}<div className="text-xs text-muted-foreground">{expense.category}</div></td><td className="p-3 text-right font-medium">{money(Number(expense.amount))}</td></tr>)}</tbody></table></div>}
      </CardContent></Card>
    </div>
  </div>
}
