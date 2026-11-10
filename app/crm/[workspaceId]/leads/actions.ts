'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'
import { redirect } from 'next/navigation'
import { recordCrmLeadPerformanceEvent } from '@/utils/crm-performance'

function isManager(access: any) {
  return access.isSuperAdmin || ['CRM_ADMIN', 'SALES_MANAGER'].includes(access.crmUser?.role)
}

async function requireLead(workspaceId: string, leadId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')
  const admin = createAdminClient()
  const { data: lead, error } = await admin.from('crm_leads').select('id, owner_user_id, company_name, status').eq('id', leadId).eq('crm_workspace_id', access.crmWorkspaceId).maybeSingle()
  if (error || !lead) throw new Error(error?.message ?? 'Lead not found.')
  if (!isManager(access) && lead.owner_user_id !== user.id) throw new Error('You can only access leads assigned to you.')
  return { user, access, supabase, admin, lead }
}

// ─── Simple add lead ────────────────────────────────────────────────────────
export async function addLead(workspaceId: string, formData: FormData) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('No access.')

  const isManager = access.isSuperAdmin || ['CRM_ADMIN', 'SALES_MANAGER'].includes(access.crmUser?.role)
  const requestedOwnerId = String(formData.get('owner_user_id') ?? '').trim()
  const ownerUserId = isManager ? (requestedOwnerId || user.id) : user.id
  if (isManager && ownerUserId !== user.id) {
    const { data: assignee } = await createAdminClient().from('crm_users').select('id').eq('crm_workspace_id', access.crmWorkspaceId).eq('user_id', ownerUserId).eq('status', 'ACTIVE').maybeSingle()
    if (!assignee) throw new Error('Choose an active teammate in this workspace.')
  }

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

  await recordCrmLeadPerformanceEvent(createAdminClient(), {
    workspaceId: access.crmWorkspaceId,
    leadId: newLead.id,
    actorUserId: user.id,
    eventType: 'ASSIGNED',
    assignedToUserId: ownerUserId,
  })

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

  revalidatePath(`/crm/${workspaceId}`)
  revalidatePath(`/crm/${workspaceId}/leads`)
  revalidatePath(`/crm/${workspaceId}/performance`)
}

// ─── Simple update lead status ───────────────────────────────────────────────
export async function updateLeadStatus(workspaceId: string, leadId: string, status: string) {
  const { user, access, supabase, lead } = await requireLead(workspaceId, leadId)

  const { error } = await supabase.from('crm_leads')
    .update({ status, updated_by: user.id })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', leadId)

  if (error) throw new Error(error.message)
  if (status !== lead.status && ['WON', 'CONVERTED'].includes(status)) {
    await recordCrmLeadPerformanceEvent(createAdminClient(), {
      workspaceId: access.crmWorkspaceId,
      leadId,
      actorUserId: user.id,
      eventType: 'CLOSED',
      assignedToUserId: lead.owner_user_id ?? user.id,
      status,
    })
  }
  revalidatePath(`/crm/${workspaceId}`)
  revalidatePath(`/crm/${workspaceId}/leads`)
  revalidatePath(`/crm/${workspaceId}/performance`)
}

// ─── Assign lead to user ──────────────────────────────────────────────────
export async function assignLead(workspaceId: string, leadId: string, ownerUserId: string) {
  const { user, access, supabase, admin, lead } = await requireLead(workspaceId, leadId)
  if (!isManager(access)) throw new Error('Only managers can assign leads.')
  if (ownerUserId) {
    const { data: assignee } = await admin.from('crm_users').select('id').eq('crm_workspace_id', access.crmWorkspaceId).eq('user_id', ownerUserId).eq('status', 'ACTIVE').maybeSingle()
    if (ownerUserId !== user.id && !assignee) throw new Error('Choose an active teammate in this workspace.')
  }

  const { error } = await supabase.from('crm_leads')
    .update({ owner_user_id: ownerUserId, updated_by: user.id })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', leadId)

  if (error) throw new Error(error.message)

  if (ownerUserId && ownerUserId !== lead.owner_user_id) {
    await recordCrmLeadPerformanceEvent(admin, {
      workspaceId: access.crmWorkspaceId,
      leadId,
      actorUserId: user.id,
      eventType: 'ASSIGNED',
      assignedToUserId: ownerUserId,
    })
  }

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
  revalidatePath(`/crm/${workspaceId}/performance`)
}

// ─── Soft delete lead ───────────────────────────────────────────────────────
export async function deleteLead(workspaceId: string, leadId: string) {
  const { user, access, supabase } = await requireLead(workspaceId, leadId)

  const { error } = await supabase.from('crm_leads')
    .update({ status: 'DELETED', updated_by: user.id })
    .eq('crm_workspace_id', access.crmWorkspaceId)
    .eq('id', leadId)

  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/leads`)
}

// ─── Add lead remark / note ──────────────────────────────────────────────────
export async function addLeadRemark(workspaceId: string, leadId: string, remark: string) {
  const { user, access, supabase } = await requireLead(workspaceId, leadId)

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

export async function createLeadReminder(workspaceId: string, leadId: string, formData: FormData) {
  const { user, access, admin, lead } = await requireLead(workspaceId, leadId)
  const subject = String(formData.get('subject') ?? '').trim()
  const details = String(formData.get('details') ?? '').trim()
  const localDateTime = String(formData.get('due_at') ?? '').trim()
  const dueAt = new Date(localDateTime)

  if (!subject || subject.length > 120) throw new Error('Enter a reminder name under 120 characters.')
  if (!localDateTime || Number.isNaN(dueAt.getTime())) throw new Error('Choose a valid date and time for this reminder.')
  if (details.length > 2000) throw new Error('Keep reminder notes under 2,000 characters.')

  const dueIso = dueAt.toISOString()
  const { error } = await admin.from('crm_activities').insert({
    crm_workspace_id: access.crmWorkspaceId,
    kind: 'TASK',
    subject,
    details: details || `Reminder for ${lead.company_name}`,
    due_at: dueIso,
    reminder_at: dueIso,
    lead_id: lead.id,
    owner_user_id: lead.owner_user_id ?? user.id,
    created_by: user.id,
  })
  if (error) throw new Error(error.message)

  revalidatePath(`/crm/${workspaceId}`)
  revalidatePath(`/crm/${workspaceId}/activities`)
  revalidatePath(`/crm/${workspaceId}/leads`)
}

