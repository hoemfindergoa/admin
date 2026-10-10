"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/utils/supabase/admin"

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient(await cookies())
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { error } = await supabase
    .from('student_kit_orders')
    .update({ status })
    .eq('id', orderId)

  if (error) {
    const { data: ownedOrgs } = await supabase.from('organizations').select('id').eq('owner_id', user.id).limit(1)
    if (ownedOrgs && ownedOrgs.length > 0) {
      const admin = createAdminClient()
      const { error: adminError } = await admin.from('student_kit_orders').update({ status }).eq('id', orderId)
      if (adminError) throw new Error(adminError.message)
    } else {
      throw new Error(error.message)
    }
  }

  revalidatePath('/dashboard/student-kits')
  revalidatePath('/dashboard/[orgId]/student-kits', 'page')
  return { success: true }
}

export async function acceptOrderWithPricing(orderId: string, itemPrices: { id: string, unit_price: number, total_price: number }[], totalAmount: number) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  // Verify super admin
  const { data: ownedOrgs } = await supabase.from('organizations').select('id').eq('owner_id', user.id).limit(1)
  if (!ownedOrgs || ownedOrgs.length === 0) throw new Error("Unauthorized")

  const admin = createAdminClient()

  // Update order items
  for (const item of itemPrices) {
    const { error: itemError } = await admin
      .from('student_kit_order_items')
      .update({ unit_price: item.unit_price, total_price: item.total_price })
      .eq('id', item.id)
    if (itemError) throw new Error(itemError.message)
  }

  // Update order status and total amount
  const { error: orderError } = await admin
    .from('student_kit_orders')
    .update({ status: 'ACCEPTED', total_amount: totalAmount })
    .eq('id', orderId)
  
  if (orderError) throw new Error(orderError.message)

  revalidatePath('/dashboard/student-kits')
  revalidatePath('/dashboard/[orgId]/student-kits', 'page')
  return { success: true }
}

export async function updatePaymentDetails(orderId: string, transactionId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  
  // Since both franchise owners and admins can update this, we need to check permissions via RLS or admin client
  const admin = createAdminClient()
  const { error } = await admin
    .from('student_kit_orders')
    .update({ 
      transaction_id: transactionId, 
      payment_status: 'PAID'
    })
    .eq('id', orderId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/student-kits')
  revalidatePath('/dashboard/[orgId]/student-kits', 'page')
  return { success: true }
}
