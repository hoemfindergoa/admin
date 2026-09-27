'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

type FinanceKind = 'fees' | 'expenses'

async function getFinanceAccess(orgId: string, kind: FinanceKind) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (
    member.role === 'FRANCHISE_ADMIN' || (Array.isArray(member.permissions) && member.permissions.includes(kind))
  ))
  if (!allowed) throw new Error(`You do not have permission to manage ${kind}.`)
  return { supabase, user }
}

export async function getFinanceWorkspace(orgId: string, kind: FinanceKind) {
  await getFinanceAccess(orgId, kind)
  const admin = createAdminClient()
  if (kind === 'fees') {
    const [{ data: students, error: studentsError }, { data: payments, error: paymentsError }] = await Promise.all([
      admin.from('students').select('id, student_name, admission_number, class_id, section_id').eq('org_id', orgId).order('student_name'),
      admin.from('school_fee_payments').select('id, student_id, amount, payment_date, payment_method, reference_number, notes, recorded_by_email').eq('org_id', orgId).order('payment_date', { ascending: false }),
    ])
    if (studentsError) throw new Error(studentsError.message)
    if (paymentsError) return { students: students ?? [], payments: [], expenses: [], ledgerReady: false }
    return { students: students ?? [], payments: payments ?? [], expenses: [], ledgerReady: true }
  }
  const { data: expenses, error } = await admin.from('school_expenses').select('id, title, category, amount, expense_date, payment_method, vendor, reference_number, notes, recorded_by_email').eq('org_id', orgId).order('expense_date', { ascending: false })
  if (error) return { students: [], payments: [], expenses: [], ledgerReady: false }
  return { students: [], payments: [], expenses: expenses ?? [], ledgerReady: true }
}

const methods = ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER']

function amountFrom(formData: FormData) {
  const amount = Number(formData.get('amount'))
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.')
  return amount
}

export async function recordFeePayment(orgId: string, formData: FormData) {
  const { supabase, user } = await getFinanceAccess(orgId, 'fees')
  const studentId = String(formData.get('student_id') ?? '').trim()
  const paymentDate = String(formData.get('payment_date') ?? '').trim()
  const paymentMethod = String(formData.get('payment_method') ?? 'CASH')
  if (!studentId || !paymentDate || !methods.includes(paymentMethod)) throw new Error('Choose a student, date, and valid payment method.')
  const amount = amountFrom(formData)
  const { error } = await supabase.from('school_fee_payments').insert({
    org_id: orgId, student_id: studentId, amount, payment_date: paymentDate, payment_method: paymentMethod,
    reference_number: String(formData.get('reference_number') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null, recorded_by: user.id, recorded_by_email: user.email ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}`)
  revalidatePath(`/dashboard/${orgId}/fees`)
}

export async function recordExpense(orgId: string, formData: FormData) {
  const { supabase, user } = await getFinanceAccess(orgId, 'expenses')
  const title = String(formData.get('title') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim()
  const expenseDate = String(formData.get('expense_date') ?? '').trim()
  const paymentMethod = String(formData.get('payment_method') ?? 'CASH')
  if (!title || !category || !expenseDate || !methods.includes(paymentMethod)) throw new Error('Enter a title and category, then choose a date and payment method.')
  const amount = amountFrom(formData)
  const { error } = await supabase.from('school_expenses').insert({
    org_id: orgId, title, category, amount, expense_date: expenseDate, payment_method: paymentMethod,
    vendor: String(formData.get('vendor') ?? '').trim() || null,
    reference_number: String(formData.get('reference_number') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null, recorded_by: user.id, recorded_by_email: user.email ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}`)
  revalidatePath(`/dashboard/${orgId}/expenses`)
}
