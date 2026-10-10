"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function placeStudentKitOrder(orgId: string, items: { className: string, quantity: number }[]) {
  const supabase = createClient(await cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Pricing is set by admin upon review, initially 0
  const totalAmount = 0

  // Insert the order
  const { data: order, error: orderError } = await supabase
    .from('student_kit_orders')
    .insert({ org_id: orgId, created_by: user.id, total_amount: totalAmount })
    .select('id')
    .single()

  if (orderError) throw new Error(orderError.message)

  // Insert the items
  const itemsToInsert = items.map(item => ({
    order_id: order.id,
    class_name: item.className,
    quantity: item.quantity,
    unit_price: 0,
    total_price: 0
  }))

  const { error: itemsError } = await supabase
    .from('student_kit_order_items')
    .insert(itemsToInsert)

  if (itemsError) throw new Error(itemsError.message)

  revalidatePath(`/dashboard/${orgId}/student-kits`)
  return { success: true }
}
