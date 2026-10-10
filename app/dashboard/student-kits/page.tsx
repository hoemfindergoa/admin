import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ArrowLeft, Package, ShoppingCart, Store, IndianRupee } from "lucide-react"
import Link from "next/link"
import { KitOrdersList } from "@/components/kit-orders-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminStudentKitsPage() {
  const supabase = createClient(await cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Simple admin check: if they own any org, they can see this page
  const { data: ownedOrgs } = await supabase
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)

  if (!ownedOrgs || ownedOrgs.length === 0) {
    redirect('/dashboard')
  }

  // Use admin client to bypass RLS for Super Admin view
  const admin = createAdminClient()
  
  const [ { data: orders }, { count: totalFranchises } ] = await Promise.all([
    admin
      .from('student_kit_orders')
      .select(`
        id, status, total_amount, payment_status, transaction_id, created_at,
        organizations ( name ),
        items:student_kit_order_items ( id, class_name, quantity, unit_price, total_price )
      `)
      .order('created_at', { ascending: false }),
    admin
      .from('organizations')
      .select('*', { count: 'exact', head: true })
  ])

  let totalOrders = 0;
  let totalKitsSold = 0;
  let totalRevenue = 0;

  if (orders) {
    totalOrders = orders.length;
    orders.forEach((order: any) => {
      totalRevenue += Number(order.total_amount || 0);
      order.items?.forEach((item: any) => {
        totalKitsSold += Number(item.quantity || 0);
      });
    });
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Student Kit Orders</h1>
          <p className="text-zinc-500 text-sm mt-1">View all kit orders placed by franchises.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kits Sold</CardTitle>
            <Package className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKitsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Franchises</CardTitle>
            <Store className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFranchises || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full mt-4">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">All Orders</h2>
        <KitOrdersList orders={orders || []} isAdmin={true} />
      </div>
    </div>
  )
}
