import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/store/user'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
export default function Logout(){
    const router = useRouter()
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const user =  useUser((state) => state.user);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut() 
            router.push('/login')
        } catch (error) {
            console.log(error); 
        }
    }

    return (
        
        <div>

        {user?.id ? <div>
            <button onClick={handleLogout}>Logout</button>
            </div> : <h1> <Link href= "/login" > Login</Link> </h1> }
        </div>
        
    );
}