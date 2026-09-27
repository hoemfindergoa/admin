  "use client"
  import React from 'react'
  import { useEffect } from 'react'
  import { createBrowserClient } from '@supabase/ssr'
  import { useUser  } from '@/lib/store/user'
  export default function Sessioprovider() {
      const setUser = useUser((state) => state.setUser);

      const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      const readUserSession =async () => 
      {
          const {data} =await supabase.auth.getSession();
          console.log("session data")
          console.log(data)


          setUser(data.session?.user);
      }
      useEffect(() => {
      readUserSession();
      
          
      }, []);
    return (
      <div></div>
    )
  }
