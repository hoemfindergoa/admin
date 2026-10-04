'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'
import { redirect } from 'next/navigation'

// ─── Simple add lead ────────────────────────────────────────────────────────
export async function addLead(workspaceId: string, formData: FormData) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const ownerUserId = String(formData.get('owner_user_id') ?? '').trim() || user.id;

  const { data: newLead, error } = await supabase.from('crm_leads').insert({
    crm_workspace_id: access.crmWorkspaceId,
    company_name: String(formData.get('company_name') ?? '').trim(),
    contact_name: String(formData.get('contact_name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim() || null,
    phone: String(formData.get('phone') ?? '').trim() || null,
    source: String(formData.get('source') ?? 'Website').trim() || 'Website',
    status: 'NEW',
    notes: String(formData.get('notes') ?? '').trim() || null,
    campaign_id: String(formData.get('campaign_id') ?? '').trim() || null,
    owner_user_id: ownerUserId,
    created_by: user.id,
    city_location: String(formData.get('city_location') ?? '').trim() || null,
    investment_budget: String(formData.get('investment_budget') ?? '').trim() || null,
    owns_property: String(formData.get('owns_property') ?? '').trim() || null,
  }).select('id, company_name').single()

  if (error) throw new Error(error.message)

  // Notify the assigned user if they didn't create it
  if (ownerUserId !== user.id) {
    await supabase.from('crm_activities').insert({
      crm_workspace_id: access.crmWorkspaceId,
      kind: 'TASK',
      subject: 'New Lead Assigned',
      details: `Lead "${newLead.company_name}" has been assigned to you.`,
      lead_id: newLead.id,
      owner_user_id: ownerUserId,
      created_by: user.id,
      due_at: new Date().toISOString()
    })
  }

  revalidatePath(`/crm/${workspaceId}/leads`)
}

// ─── Simple update lead status ───────────────────────────────────────────────
export async function updateLeadStatus(workspaceId: string, leadId: string, status: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const { error } = await supabase.from('crm_leads')
    .update({ status, updated_by: user.id })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', leadId)

  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/leads`)
}

// ─── Assign lead to user ──────────────────────────────────────────────────
export async function assignLead(workspaceId: string, leadId: string, ownerUserId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')
  
  // Only managers or the current owner can reassign
  const { data: lead } = await supabase.from('crm_leads').select('owner_user_id, company_name').eq('id', leadId).eq('crm_workspace_id', access.crmWorkspaceId).single()
  if (!lead) throw new Error('Lead not found.')
  
  const isManager = access.isSuperAdmin || ['CRM_ADMIN', 'SALES_MANAGER'].includes(access.crmUser?.role)
  if (!isManager && lead.owner_user_id !== user.id) {
    throw new Error('You can only reassign your own leads.')
  }

  const { error } = await supabase.from('crm_leads')
    .update({ owner_user_id: ownerUserId, updated_by: user.id })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', leadId)

  if (error) throw new Error(error.message)

  // Notify the newly assigned user if it's changing hands
  if (ownerUserId !== lead.owner_user_id) {
    await supabase.from('crm_activities').insert({
      crm_workspace_id: access.crmWorkspaceId,
      kind: 'TASK',
      subject: 'Lead Reassigned To You',
      details: `Lead "${lead.company_name}" has been reassigned to you.`,
      lead_id: leadId,
      owner_user_id: ownerUserId,
      created_by: user.id,
      due_at: new Date().toISOString()
    })
  }

  revalidatePath(`/crm/${workspaceId}/leads`)
}

// ─── Soft delete lead ───────────────────────────────────────────────────────
export async function deleteLead(workspaceId: string, leadId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const { error } = await supabase.from('crm_leads')
    .update({ status: 'DELETED', updated_by: user.id })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', leadId)

  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/leads`)
}

// ─── Add lead remark / note ──────────────────────────────────────────────────
export async function addLeadRemark(workspaceId: string, leadId: string, remark: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const cleanRemark = String(remark ?? '').trim()
  if (!cleanRemark) throw new Error('Remark cannot be empty.')

  const admin = createAdminClient()

  // 1. Insert timestamped note
  const { error: noteError } = await supabase.from('crm_notes').insert({
    crm_workspace_id: access.crmWorkspaceId,
    parent_type: 'LEAD',
    parent_id: leadId,
    body: cleanRemark,
    created_by: user.id,
    created_by_email: user.email ?? null,
  })

  if (noteError) throw new Error(noteError.message)

  // 2. Also keep the latest remark on the lead record and update timestamp
  await supabase.from('crm_leads')
    .update({
      notes: cleanRemark,
      updated_by: user.id,
      updated_by_email: user.email ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', leadId)

  revalidatePath(`/crm/${workspaceId}/leads`)
  revalidatePath(`/crm/${workspaceId}`)
}

