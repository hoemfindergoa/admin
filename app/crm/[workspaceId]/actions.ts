'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'
import { any } from 'zod'

const validModules = ['leads', 'accounts', 'contacts', 'deals', 'activities', 'campaigns', 'automation_rules'] as const
type Module = typeof validModules[number]
const tableByModule: Record<Module, string> = { leads: 'crm_leads', accounts: 'crm_accounts', contacts: 'crm_contacts', deals: 'crm_deals', activities: 'crm_activities', campaigns: 'crm_campaigns', automation_rules: 'crm_automation_rules' }
const fieldsByModule: Record<Module, string[]> = {
  leads: ['company_name', 'contact_name', 'email', 'phone', 'source', 'status', 'next_follow_up', 'notes', 'owner_user_id', 'campaign_id'],
  accounts: ['name', 'website', 'industry', 'phone', 'email', 'address', 'notes', 'owner_user_id'],
  contacts: ['name', 'title', 'email', 'phone', 'account_id', 'notes', 'owner_user_id'],
  deals: ['name', 'account_id', 'contact_id', 'lead_id', 'value', 'stage', 'probability', 'close_date', 'notes', 'owner_user_id'],
  activities: ['kind', 'subject', 'details', 'due_at', 'reminder_at', 'completed_at', 'lead_id', 'contact_id', 'deal_id', 'owner_user_id'],
  campaigns: ['name', 'channel', 'status', 'start_date', 'end_date', 'budget', 'owner_user_id'],
  automation_rules: ['name', 'enabled', 'trigger_event', 'task_subject', 'days_after', 'owner_user_id'],
}

async function requireCrmAccess(workspaceId: string, superAdminOnly = false) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm || (superAdminOnly && !access.isSuperAdmin)) throw new Error('You do not have permission to access this CRM action.')
  return { user, access, admin: createAdminClient(), supabase }
}

function isManager(access: any) {
  // Workspace owners (super admins) are always managers
  return access.isSuperAdmin || ['CRM_ADMIN', 'SALES_MANAGER'].includes(access.crmUser?.role)
}

function canEditRecord(access: any, userId: string, ownerId: string | null) {
  return isManager(access) || ownerId === userId || ownerId == null
}

function cleanPayload(module: Module, payload: Record<string, any>, userId: string, access: any, creating = false) {
  const clean: Record<string, any> = {}
  for (const field of fieldsByModule[module]) {
    if (!(field in payload)) continue
    if (field === 'owner_user_id' && !isManager(access)) {
      if (creating) clean.owner_user_id = userId
      continue
    }
    const value = payload[field]
    clean[field] = typeof value === 'string' && value.trim() === '' ? null : value
  }
  if (creating) {
    clean.created_by = userId
    clean.crm_workspace_id = access.crmWorkspaceId
    if (!isManager(access) && fieldsByModule[module].includes('owner_user_id')) clean.owner_user_id = userId
  }
  return clean
}

async function createLeadFollowUps(admin: ReturnType<typeof createAdminClient>, userId: string, createdLeads: any[]) {
  if (!createdLeads.length) return
  const { data: rules } = await admin.from('crm_automation_rules').select('*').eq('crm_workspace_id', createdLeads[0]?.crm_workspace_id).eq('enabled', true).eq('trigger_event', 'LEAD_CREATED')
  if (!rules?.length) return
  const due = (days: number) => { const value = new Date(); value.setDate(value.getDate() + days); return value.toISOString() }
  const activities = createdLeads.flatMap((lead) => rules.map((rule: any) => ({
    kind: 'TASK', subject: rule.task_subject, details: `Automated follow-up for ${lead.company_name}`,
    due_at: due(Number(rule.days_after ?? 1)), lead_id: lead.id,
    owner_user_id: rule.owner_user_id ?? lead.owner_user_id ?? userId, created_by: userId,
    crm_workspace_id: lead.crm_workspace_id,
  })))
  const { error } = await admin.from('crm_activities').insert(activities)
  if (error) throw new Error(`Lead saved, but its automatic follow-up could not be created: ${error.message}`)
}

export async function getCrmData(workspaceId: string) {
  const { user, access, admin } = await requireCrmAccess(workspaceId)
  const [leads, accounts, contacts, deals, activities, campaigns, notes, members, rules] = await Promise.all([
    admin.from('crm_leads').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('updated_at', { ascending: false }),
    admin.from('crm_accounts').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('updated_at', { ascending: false }),
    admin.from('crm_contacts').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('updated_at', { ascending: false }),
    admin.from('crm_deals').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('updated_at', { ascending: false }),
    admin.from('crm_activities').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('due_at', { ascending: true }),
    admin.from('crm_campaigns').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('created_at', { ascending: false }),
    admin.from('crm_notes').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('created_at', { ascending: false }),
    admin.from('crm_users').select('id, user_id, name, email, role, status').eq('crm_workspace_id', access.crmWorkspaceId).order('created_at', { ascending: true }),
    admin.from('crm_automation_rules').select('*').eq('crm_workspace_id', access.crmWorkspaceId).order('created_at', { ascending: false }),
  ])
  for (const result of [leads, accounts, contacts, deals, activities, campaigns, notes, members, rules]) if (result.error) throw new Error(result.error.message)
  const privateRows = (rows: any[]) => isManager(access) ? rows : rows.filter((row) => !row.owner_user_id || row.owner_user_id === user.id)
  const visible = {
    leads: privateRows(leads.data ?? []), accounts: privateRows(accounts.data ?? []), contacts: privateRows(contacts.data ?? []), deals: privateRows(deals.data ?? []),
    activities: privateRows(activities.data ?? []).sort((a, b) => !a.due_at ? 1 : !b.due_at ? -1 : new Date(a.due_at).getTime() - new Date(b.due_at).getTime()),
  }
  const allowedNotes = new Set([...visible.leads.map((row) => `LEAD:${row.id}`), ...visible.accounts.map((row) => `ACCOUNT:${row.id}`), ...visible.contacts.map((row) => `CONTACT:${row.id}`), ...visible.deals.map((row) => `DEAL:${row.id}`)])
  return {
    ...visible, campaigns: campaigns.data ?? [],
    notes: (notes.data ?? []).filter((note: any) => allowedNotes.has(`${note.parent_type}:${note.parent_id}`)), members: members.data ?? [], rules: access.isSuperAdmin ? rules.data ?? [] : [],
    access: { isSuperAdmin: access.isSuperAdmin, role: access.isSuperAdmin ? 'SUPER_ADMIN' : access.crmUser?.role ?? 'SALES_REP', userId: user.id, email: user.email ?? '', workspaceId },
  }
}

export async function createCrmRecord(workspaceId: string, module: Module, payload: Record<string, any>) {
  if (!validModules.includes(module)) throw new Error('Unknown CRM module.')
  const { user, access, admin, supabase } = await requireCrmAccess(workspaceId, module === 'automation_rules')
  // Only block campaigns for plain sales reps (not workspace owners or managers)
  if (module === 'campaigns' && !access.isSuperAdmin && !isManager(access)) throw new Error('Only sales managers can manage campaigns.')
  const values = cleanPayload(module, payload, user.id, access, true)
  if (module === 'leads' && values.status === 'CONVERTED') throw new Error('Create a lead first, then use lead conversion to open an opportunity.')
  const { data, error } = await supabase.from(tableByModule[module]).insert(values).select('*').single()
  if (error) throw new Error(error.message)

  if (module === 'leads') await createLeadFollowUps(admin, user.id, [data])
  revalidatePath(`/crm/${workspaceId}`)
  return data
}

export async function updateCrmRecord(workspaceId: string, module: Module, id: string, payload: Record<string, any>) {
  if (!validModules.includes(module)) throw new Error('Unknown CRM module.')
  const { user, access, admin, supabase } = await requireCrmAccess(workspaceId, module === 'automation_rules')
  if (module === 'campaigns' && !access.isSuperAdmin && !isManager(access)) throw new Error('Only sales managers can manage campaigns.')
  const { data: current, error: readError } = await admin.from(tableByModule[module]).select('*').eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id).maybeSingle()
  if (readError || !current) throw new Error(readError?.message ?? 'This record no longer exists.')
  if (!canEditRecord(access, user.id, current.owner_user_id)) throw new Error('You can only edit records assigned to you.')
  if (module === 'leads' && payload.status === 'CONVERTED') throw new Error('Use the lead conversion action to create its account, contact, and deal.')
  const values = cleanPayload(module, payload, user.id, access)
  if (!isManager(access) && current.owner_user_id == null && fieldsByModule[module].includes('owner_user_id')) values.owner_user_id = user.id
  if (module === 'leads') { values.updated_by = user.id; values.updated_by_email = user.email ?? null }
  const { error } = await supabase.from(tableByModule[module]).update(values).eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}`)
}

export async function deleteCrmRecord(workspaceId: string, module: Module, id: string) {
  if (!validModules.includes(module)) throw new Error('Unknown CRM module.')
  const { user, access, admin, supabase } = await requireCrmAccess(workspaceId, module === 'automation_rules')
  if (module === 'campaigns' && !access.isSuperAdmin && !isManager(access)) throw new Error('Only sales managers can manage campaigns.')
  const { data: current } = await admin.from(tableByModule[module]).select('id, owner_user_id').eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id).maybeSingle()
  if (!current) return
  if (!canEditRecord(access, user.id, current.owner_user_id)) throw new Error('You can only remove records assigned to you.')
  if (module === 'automation_rules' && !isManager(access)) throw new Error('Only managers can change automation rules.')
  const { error } = await supabase.from(tableByModule[module]).delete().eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}`)
}

export async function convertCrmLeadToDeal(workspaceId: string, leadId: string, dealName: string, dealValue: number) {
  const { user, access, admin } = await requireCrmAccess(workspaceId)
  const { data: lead, error } = await admin.from('crm_leads').select('*').eq('crm_workspace_id', access.crmWorkspaceId).eq('id', leadId).maybeSingle()
  if (error || !lead) throw new Error(error?.message ?? 'Lead not found.')
  if (lead.status === 'CONVERTED') throw new Error('This lead was already converted.')
  if (!canEditRecord(access, user.id, lead.owner_user_id)) throw new Error('You can only convert leads assigned to you.')
  const { data: account, error: accountError } = await admin.from('crm_accounts').insert({ crm_workspace_id: access.crmWorkspaceId, name: lead.company_name, phone: lead.phone, email: lead.email, owner_user_id: lead.owner_user_id ?? user.id, created_by: user.id }).select('id').single()
  if (accountError) throw new Error(accountError.message)
  const { data: contact, error: contactError } = await admin.from('crm_contacts').insert({ crm_workspace_id: access.crmWorkspaceId, name: lead.contact_name, email: lead.email, phone: lead.phone, account_id: account.id, lead_id: lead.id, owner_user_id: lead.owner_user_id ?? user.id, created_by: user.id }).select('id').single()
  if (contactError) throw new Error(contactError.message)
  const { error: dealError } = await admin.from('crm_deals').insert({ crm_workspace_id: access.crmWorkspaceId, name: dealName.trim() || `${lead.company_name} opportunity`, account_id: account.id, contact_id: contact.id, lead_id: lead.id, value: Math.max(0, Number(dealValue) || 0), stage: 'QUALIFICATION', probability: 20, owner_user_id: lead.owner_user_id ?? user.id, created_by: user.id })
  if (dealError) throw new Error(dealError.message)
  await admin.from('crm_leads').update({ status: 'CONVERTED', owner_user_id: lead.owner_user_id ?? user.id, updated_by: user.id, updated_by_email: user.email ?? null }).eq('crm_workspace_id', access.crmWorkspaceId).eq('id', lead.id)
  revalidatePath(`/crm/${workspaceId}`)
}

export async function createCrmNote(workspaceId: string, parentType: string, parentId: string, body: string) {
  const { user, access, admin } = await requireCrmAccess(workspaceId)
  if (!['LEAD', 'CONTACT', 'ACCOUNT', 'DEAL'].includes(parentType) || !body.trim()) throw new Error('Add a note to a valid record.')
  const table = ({ LEAD: 'crm_leads', CONTACT: 'crm_contacts', ACCOUNT: 'crm_accounts', DEAL: 'crm_deals' } as Record<string, string>)[parentType]
  const { data: parent } = await admin.from(table!).select('id, owner_user_id').eq('crm_workspace_id', access.crmWorkspaceId).eq('id', parentId).maybeSingle()
  if (!parent || !canEditRecord(access, user.id, parent.owner_user_id)) throw new Error('You cannot add notes to this record.')
  const { error } = await admin.from('crm_notes').insert({ crm_workspace_id: access.crmWorkspaceId, parent_type: parentType, parent_id: parentId, body: body.trim(), created_by: user.id, created_by_email: user.email ?? null })
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}`)
}

export async function importCrmLeads(workspaceId: string, rows: Record<string, string>[]) {
  const { user, access, admin } = await requireCrmAccess(workspaceId)
  if (!Array.isArray(rows) || rows.length > 500) throw new Error('Import up to 500 leads at a time.')
  const values = rows.map((row) => ({
    company_name: String(row.company_name ?? row.company ?? '').trim(), contact_name: String(row.contact_name ?? row.name ?? '').trim(),
    email: String(row.email ?? '').trim() || null, phone: String(row.phone ?? '').trim() || null,
    source: String(row.source ?? '').trim() || 'CSV import', notes: String(row.notes ?? '').trim() || null,
    status: 'NEW', owner_user_id: isManager(access) ? (row.owner_user_id || null) : user.id,
    created_by: user.id, created_by_email: user.email ?? null, updated_by: user.id, updated_by_email: user.email ?? null,
    crm_workspace_id: access.crmWorkspaceId,
  })).filter((row) => row.company_name && row.contact_name)
  if (!values.length) throw new Error('No valid rows found. Each row needs a company and contact name.')
  const { data: created, error } = await admin.from('crm_leads').insert(values).select('id, company_name, owner_user_id, crm_workspace_id')
  if (error) throw new Error(error.message)
  await createLeadFollowUps(admin, user.id, created ?? [])
  revalidatePath(`/crm/${workspaceId}`)
  return values.length
}

export async function getCrmMembers(workspaceId: string) {
  const { access } = await requireCrmAccess(workspaceId, true)
  const admin = createAdminClient()
  const { data, error } = await admin.from('crm_users').select('id, name, email, role, status, invited_by_email, created_at').eq('crm_workspace_id', access.crmWorkspaceId).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function inviteCrmMember(workspaceId: string, formData: FormData) {
  const { user, access, admin } = await requireCrmAccess(workspaceId, true)
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = String(formData.get('role') ?? 'SALES_REP')
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !['SALES_MANAGER', 'SALES_REP'].includes(role)) throw new Error('Enter a name, valid email, and CRM role.')
  const { data: existingMember, error: existingError } = await admin.from('crm_users').select('id, status').eq('crm_workspace_id', access.crmWorkspaceId).ilike('email', email).maybeSingle()
  if (existingError) throw new Error(existingError.message)
  const { data: otherWorkspaceMember, error: memberLookupError } = await admin.from('crm_users').select('crm_workspace_id').ilike('email', email).maybeSingle()
  if (memberLookupError) throw new Error(memberLookupError.message)
  if (otherWorkspaceMember && otherWorkspaceMember.crm_workspace_id !== access.crmWorkspaceId) throw new Error('This person already belongs to a different CRM workspace.')
  if (existingMember?.status === 'ACTIVE') throw new Error('This person already has access to the CRM.')
  const [{ data: orgMember }, { data: teacher }, { data: parent }] = await Promise.all([
    admin.from('organization_users').select('id').ilike('email', email).limit(1).maybeSingle(),
    admin.from('school_teachers').select('id').ilike('email', email).limit(1).maybeSingle(),
    admin.from('school_parents').select('id').ilike('email', email).limit(1).maybeSingle(),
  ])
  if (orgMember || teacher || parent) throw new Error('This email belongs to a school user. CRM accounts must stay separate.')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000'
  const redirectTo = `${siteUrl}/set-password?next=%2Fcrm%2F${workspaceId}`
  const { data: invitation, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: name, role: 'CRM_MEMBER' }, redirectTo })
  let authUserId = invitation?.user?.id ?? null
  let existingAccount = false
  if (inviteError) {
    if (!/already\s+(been\s+)?registered/i.test(inviteError.message)) throw new Error(inviteError.message)
    const { data: authUsers, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (listError) throw new Error(listError.message)
    const existingAuth = authUsers.users.find((item) => item.email?.toLowerCase() === email)
    if (!existingAuth) throw new Error(`Could not find the existing account for ${email}.`)
    authUserId = existingAuth.id
    existingAccount = true
    const { error: metadataError } = await admin.auth.admin.updateUserById(existingAuth.id, { user_metadata: { ...existingAuth.user_metadata, full_name: name, role: 'CRM_MEMBER' } })
    if (metadataError) throw new Error(metadataError.message)
    const { error: recoveryError } = await admin.auth.resetPasswordForEmail(email, { redirectTo })
    if (recoveryError) throw new Error(`Could not send the CRM setup link: ${recoveryError.message}`)
  }
  const record = { crm_workspace_id: access.crmWorkspaceId, user_id: authUserId, name, email, role, status: 'PENDING', invited_by: user.id, invited_by_email: user.email ?? null }
  const write = existingMember ? await admin.from('crm_users').update(record).eq('crm_workspace_id', access.crmWorkspaceId).eq('id', existingMember.id) : await admin.from('crm_users').insert(record)
  if (write.error) throw new Error(write.error.message)
  revalidatePath(`/crm/${workspaceId}/team`)
  return { existingAccount }
}

export async function updateCrmMemberRole(workspaceId: string, id: string, role: string) {
  const { access, admin } = await requireCrmAccess(workspaceId, true)
  if (!['SALES_MANAGER', 'SALES_REP'].includes(role)) throw new Error('Select a valid team role.')
  const { error } = await admin.from('crm_users').update({ role }).eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/team`)
}

export async function removeCrmMember(workspaceId: string, id: string) {
  const { access, admin } = await requireCrmAccess(workspaceId, true)
  const { error } = await admin.from('crm_users').delete().eq('crm_workspace_id', access.crmWorkspaceId).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/crm/${workspaceId}/team`)
}
