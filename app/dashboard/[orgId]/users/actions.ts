'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getOrgUserAccess(supabase: ReturnType<typeof createClient>, orgId: string, userId: string) {
  const [{ data: org }, { data: membership }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role').eq('org_id', orgId).eq('user_id', userId).limit(1).maybeSingle(),
  ])
  const isOwner = org?.owner_id === userId
  return isOwner || membership?.role === 'FRANCHISE_ADMIN'
}

export async function getOrganizationUserContext(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { userId: null, email: null, canManageUsers: false }
  const canManageUsers = await getOrgUserAccess(supabase, orgId, user.id)
  return { userId: user.id, email: user.email ?? null, canManageUsers }
}

async function requireOrgUserManager(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const canManageUsers = await getOrgUserAccess(supabase, orgId, user.id)
  if (!canManageUsers) throw new Error('Unauthorized')
  return { supabase, user, adminClient: createAdminClient() }
}

export async function getOrganizationUsers(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return []
  const canManageUsers = await getOrgUserAccess(supabase, orgId, caller.id)
  const queryClient = canManageUsers ? createAdminClient() : supabase

  const { data: users, error } = await queryClient
    .from('organization_users')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  // Repair rows created before OAuth sign-in was linked to franchise membership.
  const pendingUsers = (users ?? []).filter((user) => user.status !== 'ACTIVE')
  if (pendingUsers.length > 0) {
    const adminClient = createAdminClient()
    const { data: authUsers } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const confirmedByEmail = new Map(
      (authUsers?.users ?? [])
        .filter((authUser) => authUser.email_confirmed_at)
        .map((authUser) => [authUser.email?.toLowerCase(), authUser.id])
    )
    for (const member of pendingUsers) {
      const authUserId = confirmedByEmail.get(member.email.toLowerCase())
      if (!authUserId) continue
      await adminClient
        .from('organization_users')
        .update({ user_id: authUserId, status: 'ACTIVE' })
        .eq('id', member.id)
        .eq('org_id', orgId)
      member.user_id = authUserId
      member.status = 'ACTIVE'
    }
  }

  return users
}

export async function inviteUser(orgId: string, formData: FormData, permissions: string[]) {
  const { supabase, adminClient } = await requireOrgUserManager(orgId)

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  // Send invite email + create auth user via admin API
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL}/set-password`
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        full_name: name,
        role: 'STAFF',
        org_id: orgId,
      },
      redirectTo,
    }
  )

  let existingAuthUserId: string | null = null
  if (inviteError) {
    // If user already exists in auth, we can still add them to the org
    const duplicateAccount = /already\s+(been\s+)?registered/i.test(inviteError.message)
    if (!duplicateAccount) {
      throw new Error(inviteError.message)
    }

    const { data: authUsers, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    if (listError) throw new Error(listError.message)
    existingAuthUserId = authUsers.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id ?? null
  }

  const authUserId = inviteData?.user?.id ?? existingAuthUserId

  // Supabase will not send another invite to an address that already has an account.
  // Send a password recovery/setup link in that case instead.
  if (existingAuthUserId) {
    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (recoveryError) throw new Error(recoveryError.message)
  }

  // Upsert organization_users record (on conflict of org_id + email, update)
  const { error: upsertError } = await adminClient
    .from('organization_users')
    .upsert(
      {
        org_id: orgId,
        user_id: authUserId,
        name,
        email,
        phone,
        role: 'STAFF',
        permissions,
        status: existingAuthUserId ? 'ACTIVE' : 'PENDING',
      },
      { onConflict: 'org_id,email' }
    )

  if (upsertError) throw new Error(upsertError.message)

  revalidatePath(`/dashboard/${orgId}/users`)
}

export async function updateUserPermissions(orgId: string, organizationUserId: string, permissions: string[]) {
  const { adminClient, user: caller } = await requireOrgUserManager(orgId)
  const { data: target } = await adminClient
    .from('organization_users')
    .select('user_id')
    .eq('id', organizationUserId)
    .eq('org_id', orgId)
    .maybeSingle()
  if (!target || target.user_id === caller.id) throw new Error('You cannot edit your own access')

  const { error } = await adminClient
    .from('organization_users')
    .update({ permissions })
    .eq('id', organizationUserId)
    .eq('org_id', orgId)
  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/${orgId}/users`)
}


export async function removeUser(orgId: string, userId: string) {
  const { adminClient, user: caller } = await requireOrgUserManager(orgId)
  const { data: target } = await adminClient
    .from('organization_users')
    .select('user_id')
    .eq('id', userId)
    .eq('org_id', orgId)
    .maybeSingle()
  if (!target || target.user_id === caller.id) throw new Error('You cannot remove your own access')

  const { error } = await adminClient
    .from('organization_users')
    .delete()
    .eq('id', userId)
    .eq('org_id', orgId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/${orgId}/users`)
}
