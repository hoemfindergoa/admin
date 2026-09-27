'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      })
      if (resetError) {
        setError(resetError.message)
        return
      }
      setSent(true)
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-xl border bg-background p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="text-sm text-muted-foreground">Enter your account email and we’ll send a secure password setup link.</p>
        </div>
        {sent ? (
          <p className="rounded-md bg-muted p-3 text-sm">If an account exists for that email, a password setup link is on its way.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>{isPending ? 'Sending…' : 'Send password link'}</Button>
          </>
        )}
        <p className="text-center text-sm text-muted-foreground"><Link href="/login" className="underline">Back to sign in</Link></p>
      </form>
    </main>
  )
}
