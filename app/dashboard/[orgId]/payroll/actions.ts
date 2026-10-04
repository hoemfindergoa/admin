'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getPayrollAccess(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (member?.role === 'FRANCHISE_ADMIN' || (
    Array.isArray(member.permissions) && member.permissions.includes('payroll')
  )))
  
  if (!allowed) throw new Error('You do not have permission to manage payroll.')
  return { supabase, admin: createAdminClient() }
}

export async function getPayrollData(orgId: string) {
  const { admin } = await getPayrollAccess(orgId)
  
  // 1. Get staff (from school_teachers)
  const { data: teachers, error: teacherError } = await admin.from('school_teachers')
    .select('id, name, role, status')
    .eq('org_id', orgId)
    .order('name')
  
  if (teacherError) throw new Error(teacherError.message)
    
  // 2. Get compensation data
  const { data: compensation, error: compError } = await admin.from('staff_compensation')
    .select('*')
    .eq('org_id', orgId)
    
  if (compError) throw new Error(compError.message)
    
  // 3. Get pay runs
  const { data: payRuns, error: runError } = await admin.from('payroll_runs')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    
  if (runError) throw new Error(runError.message)
    
  // 4. Get settings
  const { data: settings, error: settingsError } = await admin.from('payroll_settings')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle()
    
  if (settingsError) throw new Error(settingsError.message)

  // Merge staff with their compensation
  const staff = teachers?.map(teacher => {
    const comp = compensation?.find(c => c.staff_id === teacher.id) || {
      base_salary: 0,
      allowances: 0,
      deductions: 0,
      bank_account_number: '',
      tax_regime: 'new'
    }
    return {
      id: teacher.id,
      name: teacher.name,
      role: teacher.role || 'Teacher',
      status: teacher.status,
      baseSalary: Number(comp.base_salary),
      allowances: Number(comp.allowances),
      deductions: Number(comp.deductions),
      netSalary: Number(comp.base_salary) + Number(comp.allowances) - Number(comp.deductions),
      bankAccount: comp.bank_account_number,
      taxRegime: comp.tax_regime
    }
  }) || []

  return {
    staff,
    payRuns: payRuns?.map(run => ({
      id: run.id,
      month: run.month_name,
      totalAmount: Number(run.total_amount),
      status: run.status,
      date: run.run_date || run.created_at.split('T')[0]
    })) || [],
    settings: settings || { pf_percentage: 12, pt_rule: 'state', bank_integration_status: 'NOT_CONNECTED' }
  }
}

export async function updateStaffCompensation(orgId: string, staffId: string, data: { baseSalary: number, allowances: number, deductions: number, bankAccount: string, taxRegime: string }) {
  const { admin } = await getPayrollAccess(orgId)
  
  const { error } = await admin.from('staff_compensation').upsert({
    org_id: orgId,
    staff_id: staffId,
    base_salary: data.baseSalary,
    allowances: data.allowances,
    deductions: data.deductions,
    bank_account_number: data.bankAccount,
    tax_regime: data.taxRegime,
    updated_at: new Date().toISOString()
  }, { onConflict: 'staff_id' })
  
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/payroll`)
}

export async function updatePayrollSettings(orgId: string, data: { pfPercentage: number, ptRule: string }) {
  const { admin } = await getPayrollAccess(orgId)
  
  const { error } = await admin.from('payroll_settings').upsert({
    org_id: orgId,
    pf_percentage: data.pfPercentage,
    pt_rule: data.ptRule,
    updated_at: new Date().toISOString()
  }, { onConflict: 'org_id' })
  
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/payroll`)
}

export async function runPayroll(orgId: string) {
  const { admin } = await getPayrollAccess(orgId)

  // 1. Get all active staff who have compensation details
  const { data: staff, error: staffError } = await admin.from('school_teachers')
    .select('id, name, status, staff_compensation ( base_salary, allowances, deductions )')
    .eq('org_id', orgId)
    .eq('status', 'ACTIVE')
  
  if (staffError) throw new Error(staffError.message)
  
  if (!staff || staff.length === 0) {
    throw new Error('No active staff found for this organization.')
  }

  // Generate current month name
  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  
  // 2. Check if a payroll run for this month already exists
  const { data: existingRun } = await admin.from('payroll_runs')
    .select('id')
    .eq('org_id', orgId)
    .eq('month_name', monthName)
    .maybeSingle()
    
  if (existingRun) {
    throw new Error(`A payroll run for ${monthName} already exists.`)
  }

  // 3. Create the payroll run
  const { data: run, error: runError } = await admin.from('payroll_runs')
    .insert({
      org_id: orgId,
      month_name: monthName,
      run_date: new Date().toISOString(),
      status: 'Draft'
    })
    .select('id')
    .single()
    
  if (runError) throw new Error(runError.message)
  if (!run) throw new Error('Failed to create payroll run.')

  // 4. Create slips for each staff member
  const slipsToInsert = staff.map((s: any) => {
    // Note: staff_compensation comes back as an array if it's a one-to-many, 
    // but in our schema it's one-to-one so it might be a single object or an array of one
    const comp = Array.isArray(s.staff_compensation) ? s.staff_compensation[0] : s.staff_compensation
    
    const baseSalary = comp?.base_salary || 0
    const allowances = comp?.allowances || 0
    const deductions = comp?.deductions || 0
    const netSalary = Number(baseSalary) + Number(allowances) - Number(deductions)

    return {
      run_id: run.id,
      org_id: orgId,
      staff_id: s.id,
      base_salary: baseSalary,
      allowances: allowances,
      deductions: deductions,
      net_salary: netSalary,
      status: 'Pending'
    }
  }).filter((s) => s.net_salary > 0) // Only generate slips if they have a net salary

  if (slipsToInsert.length > 0) {
    const { error: slipsError } = await admin.from('payroll_slips').insert(slipsToInsert)
    if (slipsError) throw new Error(slipsError.message)
  }

  revalidatePath(`/dashboard/${orgId}/payroll`)
}
