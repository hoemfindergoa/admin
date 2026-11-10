'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { getCrmAccess } from '@/utils/crm-access'

const SUCCESS_STATUSES = new Set(['WON', 'CONVERTED'])

export async function getCrmPerformanceData(workspaceId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('You do not have access to this CRM workspace.')
  if (!access.isSuperAdmin && !['CRM_ADMIN', 'SALES_MANAGER'].includes(access.crmUser?.role)) {
    redirect(`/crm/${workspaceId}`)
  }
  const admin = createAdminClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const [{ data: members, error: memberError }, { data: workspace, error: workspaceError }, { data: leads, error: leadError }, { data: events, error: eventError }] = await Promise.all([
    admin.from('crm_users').select('user_id, name, email, role, status').eq('crm_workspace_id', access.crmWorkspaceId).eq('status', 'ACTIVE'),
    admin.from('crm_workspaces').select('owner_user_id').eq('id', access.crmWorkspaceId).maybeSingle(),
    admin.from('crm_leads').select('id, owner_user_id, status').eq('crm_workspace_id', access.crmWorkspaceId).neq('status', 'DELETED'),
    admin.from('crm_lead_performance_events').select('lead_id, event_type, assigned_to_user_id, status, created_at').eq('crm_workspace_id', access.crmWorkspaceId).gte('created_at', since),
  ])
  const error = memberError ?? workspaceError ?? leadError ?? eventError
  if (error) throw new Error(error.message)

  const team = (members ?? []).filter((member: any) => member.user_id).map((member: any) => ({
    userId: member.user_id,
    name: member.name || member.email || 'CRM member',
    email: member.email ?? '',
    role: member.role,
  }))
  if (workspace?.owner_user_id && !team.some((member: any) => member.userId === workspace.owner_user_id)) {
    team.unshift({ userId: workspace.owner_user_id, name: 'Workspace admin', email: '', role: 'SUPER_ADMIN' })
  }

  const assignmentCounts = new Map<string, Set<string>>()
  const closeCounts = new Map<string, Set<string>>()
  for (const event of events ?? []) {
    const userId = event.assigned_to_user_id
    if (!userId) continue
    if (event.event_type === 'ASSIGNED') {
      if (!assignmentCounts.has(userId)) assignmentCounts.set(userId, new Set())
      assignmentCounts.get(userId)!.add(event.lead_id)
    }
    if (event.event_type === 'CLOSED' && SUCCESS_STATUSES.has(event.status ?? '')) {
      if (!closeCounts.has(userId)) closeCounts.set(userId, new Set())
      closeCounts.get(userId)!.add(event.lead_id)
    }
  }

  const allLeads = leads ?? []
  const rows = team.map((member: any) => {
    const owned = allLeads.filter((lead: any) => lead.owner_user_id === member.userId)
    return {
      ...member,
      assignedNow: owned.length,
      assignedThisWeek: assignmentCounts.get(member.userId)?.size ?? 0,
      successfulNow: owned.filter((lead: any) => SUCCESS_STATUSES.has(lead.status)).length,
      closedThisWeek: closeCounts.get(member.userId)?.size ?? 0,
    }
  }).sort((a: any, b: any) => b.closedThisWeek - a.closedThisWeek || b.assignedThisWeek - a.assignedThisWeek || a.name.localeCompare(b.name))

  return {
    since,
    totalAssigned: rows.reduce((sum: number, row: any) => sum + row.assignedNow, 0),
    assignedThisWeek: [...assignmentCounts.values()].reduce((sum, leads) => sum + leads.size, 0),
    closedThisWeek: [...closeCounts.values()].reduce((sum, leads) => sum + leads.size, 0),
    successfulNow: rows.reduce((sum: number, row: any) => sum + row.successfulNow, 0),
    rows,
  }
}
