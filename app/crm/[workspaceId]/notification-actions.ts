'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getCrmAccess } from '@/utils/crm-access'
import { getCrmNotificationSnapshotForUser } from '@/utils/crm-notifications'

export async function getCrmNotificationSnapshot(workspaceId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const access = await getCrmAccess(user.id, workspaceId)
  if (!access.canAccessCrm) throw new Error('You do not have access to this CRM workspace.')

  return getCrmNotificationSnapshotForUser(access.crmWorkspaceId, user.id)
}
