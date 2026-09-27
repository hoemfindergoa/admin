'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [isPending, startTransition] = useTransition()
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    let cancelled = false
    const establishSession = async () => {
      try {
        const url = new URL(window.location.href)
        const tokenHash = url.searchParams.get('token_hash')
        const otpType = url.searchParams.get('type')

        let authError: Error | null = null
        if (tokenHash && otpType && ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'].includes(otpType)) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
          })
          authError = verifyError
        }

        // The browser client handles PKCE codes and URL-fragment sessions during initialization.
        if (tokenHash) {
          window.history.replaceState(null, '', url.pathname)
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (cancelled) return
        if (authError || userError || !user) {
          setError('This page needs a valid invite or password setup link. Request a fresh password link below.')
          setAuthenticated(false)
        } else {
          setAuthenticated(true)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          console.error('Password setup authentication failed:', cause)
          setError('We could not verify this link. Request a fresh password link below.')
          setAuthenticated(false)
        }
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }

    void establishSession()
    return () => { cancelled = true }
  }, [supabase])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Use a password with at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    startTransition(async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setError('Your sign-in session is missing. Request a fresh password link and open it in this browser.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      await fetch('/auth/activate', { method: 'POST' })
      const requestedNext = new URLSearchParams(window.location.search).get('next')
      const parentAppUrl = process.env.NEXT_PUBLIC_PARENT_APP_URL
      const isInternal = !!requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
      const isParentApp = !!parentAppUrl && !!requestedNext && (requestedNext === parentAppUrl || requestedNext.startsWith(`${parentAppUrl}?`) || requestedNext.startsWith(`${parentAppUrl}#`))
      const next = isInternal || isParentApp ? requestedNext as string : '/dashboard'
      if (isParentApp) window.location.assign(next)
      else router.replace(next)
      router.refresh()
    })
  }

  function requestPasswordLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setLinkSent(true)
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-5 rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Set your password</h1>
          <p className="text-sm text-muted-foreground">Create a password to sign in with your email. You can also continue using Google.</p>
        </div>
        {!authReady && <p className="text-sm text-muted-foreground">Verifying your invitation…</p>}
        {authReady && authenticated && <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password">Password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving password…' : 'Save password'}
          </Button>
        </form>}
        {error && !authenticated && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {authReady && !authenticated && (linkSent ? (
          <p className="rounded-md bg-muted p-3 text-sm">If an account exists for that address, a password setup link is on its way. Open the link in this browser.</p>
        ) : (
          <form onSubmit={requestPasswordLink} className="space-y-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">If you already accepted the invite, request a password setup link to verify your account.</p>
            <Label htmlFor="setup-email">Account email</Label>
            <Input id="setup-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button type="submit" variant="outline" className="w-full" disabled={isPending}>
              {isPending ? 'Sending link…' : 'Email me a password link'}
            </Button>
          </form>
        ))}
      </div>
    </main>
  )
}
