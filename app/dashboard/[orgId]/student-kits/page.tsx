import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { KitOrderForm } from "./kit-order-form"
import { KitOrdersList } from "@/components/kit-orders-list"

export default async function StudentKitsPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params
  const supabase = createClient(await cookies())

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: classes }, { data: orders }] = await Promise.all([
    supabase.from('school_classes').select('id, name').eq('org_id', orgId).order('sort_order'),
    supabase
      .from('student_kit_orders')
      .select(`
        id, status, total_amount, payment_status, transaction_id, created_at,
        organizations ( name ),
        items:student_kit_order_items(id, class_name, quantity, unit_price, total_price)
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
  ])

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto py-8">
      <div className="flex items-start justify-between w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Student Kits</h1>
          <p className="text-zinc-500 text-sm mt-1">Order student kits for your classes.</p>
        </div>
        <KitOrderForm orgId={orgId} classes={classes || []} />
      </div>

      <div className="w-full mt-4">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Order History</h2>
        <KitOrdersList orders={orders || []} isAdmin={false} />
      </div>
    </div>
  )
}
