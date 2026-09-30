'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function getCrmAccess(userId: string, workspaceId?: string | null) {
  const admin = createAdminClient()
  const [{ data: profile }, { data: memberships }, { data: schoolUser }, { data: teacher }, { data: parent }] = await Promise.all([
    admin.from('profiles').select('role').eq('id', userId).maybeSingle(),
    admin.from('crm_users').select('id, crm_workspace_id, name, email, role, status').eq('user_id', userId).eq('status', 'ACTIVE'),
    admin.from('organization_users').select('id').eq('user_id', userId).limit(1).maybeSingle(),
    admin.from('school_teachers').select('id').eq('user_id', userId).limit(1).maybeSingle(),
    admin.from('school_parents').select('id').eq('user_id', userId).limit(1).maybeSingle(),
  ])

  const isSuperAdminRole = profile?.role === 'SUPER_ADMIN' || profile?.role === 'FRANCHISE_ADMIN'

  // If a workspaceId is provided, validate ownership/membership against that specific workspace
  if (workspaceId) {
    // Check if user owns this workspace (via organization ownership)
    const { data: ownedWorkspace } = await admin
      .from('crm_workspaces')
      .select('id, name, organization_id')
      .eq('id', workspaceId)
      .eq('owner_user_id', userId)
      .maybeSingle()

    const isSuperAdmin = isSuperAdminRole && !!ownedWorkspace
    const crmUser = memberships?.find((m: any) => m.crm_workspace_id === workspaceId) ?? null
    const isCrmMember = !!crmUser && !schoolUser && !teacher && !parent

    // Super admin owns this workspace OR active member of this workspace
    const canAccess = isSuperAdmin || isCrmMember

    console.log('CRM Access Debug (With workspaceId):', {
      userId,
      workspaceId,
      role: profile?.role,
      isSuperAdminRole,
      hasOwnedWorkspace: !!ownedWorkspace,
      isSuperAdmin,
      isCrmMember,
      canAccess
    })

    return {
      isSuperAdmin,
      isCrmMember,
      canAccessCrm: canAccess,
      crmUser,
      crmWorkspaceId: canAccess ? workspaceId : null,
      workspaceName: ownedWorkspace?.name ?? null,
    }
  }

  // No workspaceId provided — find all workspaces the user can access
  // For super admins: find all workspaces they own
  const { data: ownedWorkspaces } = isSuperAdminRole
    ? await admin.from('crm_workspaces').select('id, name, organization_id').eq('owner_user_id', userId).order('created_at', { ascending: true })
    : { data: null }

  const isSuperAdmin = isSuperAdminRole && !!(ownedWorkspaces?.length)

  // For CRM members: pick the single workspace they belong to
  const crmUser = memberships?.find((m: any) =>
    !isSuperAdmin || (ownedWorkspaces?.some((w: any) => w.id === m.crm_workspace_id))
  ) ?? null

  // Resolve single workspace: super admin always gets their first workspace (preventing multi-workspace selector)
  const singleOwnedWorkspace = ownedWorkspaces?.length ? ownedWorkspaces[0] : null
  const crmWorkspaceId = singleOwnedWorkspace?.id ?? crmUser?.crm_workspace_id ?? null

  const isCrmMember = !!crmUser && !schoolUser && !teacher && !parent
  const canAccessCrm = !!(crmWorkspaceId) && (isSuperAdmin || isCrmMember)

  console.log('CRM Access Debug (No workspaceId):', {
    userId,
    role: profile?.role,
    isSuperAdminRole,
    isSuperAdmin,
    isCrmMember,
    ownedWorkspacesCount: ownedWorkspaces?.length,
    crmWorkspaceId,
    canAccessCrm
  })

  return {
    isSuperAdmin,
    isCrmMember,
    canAccessCrm,
    crmUser: isSuperAdmin ? (crmUser ?? null) : crmUser,
    crmWorkspaceId,
    workspaceName: singleOwnedWorkspace?.name ?? null,
    // For super admins with multiple workspaces, expose them all for the picker
    ownedWorkspaces: isSuperAdmin ? (ownedWorkspaces ?? []) : [],
  }
}
