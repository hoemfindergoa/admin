import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Navbar from '../app/navbar/navbar'

export default async function Index() {
  const cookieStore = cookies()

  const canInitSupabaseClient = () => {
    // This function is just for the interactive tutorial.
    // Feel free to remove it once you have Supabase connected.
    try {
      createClient(cookieStore)
      return true
    } catch (e) {
      return false
    }
  }
  const isSupabaseConnected = canInitSupabaseClient()
  return (
    <div>
     <Navbar/>
    </div>
  )
}
