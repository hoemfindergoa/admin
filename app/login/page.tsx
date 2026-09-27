import Link from 'next/link'
import { headers, cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Chrome } from 'lucide-react'
import Loginform from '../navbar/loginform'
import { FcGoogle } from 'react-icons/fc'

export default function Login({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    return redirect('/dashboard')
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-balance text-muted-foreground">
              Sign in to manage your franchise
            </p>
          </div>
          <form action={signIn} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline text-muted-foreground"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            {searchParams?.message && (
              <p className="text-sm text-red-500 text-center">
                {searchParams.message}
              </p>
            )}
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Loginform />
          
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-zinc-900 z-0"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-12">
           <div className="max-w-md text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Streamline your school operations.</h2>
              <p className="text-lg text-zinc-400">
                A unified, single-domain B2B SaaS platform that enables a franchisor to establish and manage multiple school franchises seamlessly.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
