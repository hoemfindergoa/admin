type LeadPerformanceEvent = {
  workspaceId: string
  leadId: string
  actorUserId: string
  eventType: 'ASSIGNED' | 'CLOSED'
  assignedToUserId: string | null
  status?: string | null
}

export async function recordCrmLeadPerformanceEvent(admin: any, event: LeadPerformanceEvent) {
  if (!event.assignedToUserId) return
  const { error } = await admin.from('crm_lead_performance_events').insert({
    crm_workspace_id: event.workspaceId,
    lead_id: event.leadId,
    actor_user_id: event.actorUserId,
    event_type: event.eventType,
    assigned_to_user_id: event.assignedToUserId,
    status: event.status ?? null,
  })
  if (error) console.error('Could not record CRM lead performance event:', error.message)
}
