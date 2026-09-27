import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST() {
  const supabase = createClient(await cookies())
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user?.email) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const admin = createAdminClient()
  const accountRole = user.user_metadata?.role
  await Promise.all([
    admin.from('school_teachers').update({ user_id: user.id, status: 'ACTIVE' }).eq('email', user.email),
    admin.from('school_parents').update({ user_id: user.id, status: 'ACTIVE' }).eq('email', user.email),
  ])
  if (accountRole !== 'TEACHER' && accountRole !== 'PARENT') {
    await admin.from('organization_users').update({ user_id: user.id, status: 'ACTIVE' }).eq('email', user.email)
  }
  return NextResponse.json({ ok: true })
}
