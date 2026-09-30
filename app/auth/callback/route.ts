import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

const EMAIL_OTP_TYPES = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'] as const

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the Auth Helpers package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const otpType = requestUrl.searchParams.get('type')

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  let authUser: { id: string; email?: string } | null = null

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(new URL('/login?message=This+link+is+invalid+or+expired', requestUrl.origin))
    authUser = data.user
  } else if (tokenHash && otpType && EMAIL_OTP_TYPES.includes(otpType as typeof EMAIL_OTP_TYPES[number])) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as typeof EMAIL_OTP_TYPES[number],
    })
    if (error) return NextResponse.redirect(new URL('/login?message=This+link+is+invalid+or+expired', requestUrl.origin))
    authUser = data.user
  } else if (tokenHash || otpType) {
    return NextResponse.redirect(new URL('/login?message=This+link+is+invalid+or+expired', requestUrl.origin))
  }

  if (authUser?.email) {
    const adminClient = createAdminClient()
    const accountRole = (authUser as any).user_metadata?.role
    await Promise.all([
      adminClient.from('school_teachers').update({ user_id: authUser.id, status: 'ACTIVE' }).eq('email', authUser.email),
      adminClient.from('school_parents').update({ user_id: authUser.id, status: 'ACTIVE' }).eq('email', authUser.email),
      adminClient.from('crm_users').update({ user_id: authUser.id, status: 'ACTIVE' }).eq('email', authUser.email),
    ])
    if (accountRole !== 'TEACHER' && accountRole !== 'PARENT' && accountRole !== 'CRM_MEMBER') {
      await adminClient.from('organization_users').update({ user_id: authUser.id, status: 'ACTIVE' }).eq('email', authUser.email)
    }
  }

  const requestedNext = requestUrl.searchParams.get('next')
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/dashboard'
  // The default Supabase email template returns the session in the URL fragment.
  // Fragments are not sent to server routes, so let a browser-side callback read it.
  return NextResponse.redirect(new URL(`/auth/complete?next=${encodeURIComponent(next)}`, requestUrl.origin))
}
