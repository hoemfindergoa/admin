"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { usePathname } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'

export default function LoginForm() {
  const pathname = usePathname()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const handleLoginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo: location.origin + "/auth/callback?next=" + pathname,
      },
    })
  }

  return (
    <div className='flex flex-col gap-4 w-full'>
      <Button 
        variant="outline" 
        className='w-full flex items-center justify-center gap-2 h-10' 
        onClick={handleLoginWithGoogle}
        type="button"
      >
        <FcGoogle className="w-5 h-5" />
        Continue with Google
      </Button>
    </div>
  )
}
