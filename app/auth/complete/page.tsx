'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function AuthCompletePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    let cancelled = false
    const finishAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      const requestedNext = params.get('next')
      const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
        ? requestedNext
        : '/dashboard'
      // The browser client processes auth codes and URL fragments during initialization.
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (cancelled) return
      if (userError || !user) {
        setError('This link is invalid or expired. Ask your franchise admin to send a new invitation.')
        return
      }
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      router.replace(next)
      router.refresh()
    }

    void finishAuth()
    return () => { cancelled = true }
  }, [router, supabase])

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-3 rounded-xl border bg-background p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Completing sign in</h1>
        <p className="text-sm text-muted-foreground">Please wait while we verify your invitation.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {error && <Link href="/forgot-password" className="text-sm underline">Request a password setup link</Link>}
      </div>
    </main>
  )
}
