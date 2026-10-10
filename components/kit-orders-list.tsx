"use client"

import { useState, useMemo } from "react"
import { KitOrderCard } from "./kit-order-card"
import { Package, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface KitOrdersListProps {
  orders: any[]
  isAdmin?: boolean
}

export function KitOrdersList({ orders, isAdmin = true }: KitOrdersListProps) {
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState("")

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Filter by status
      if (filter !== "ALL" && order.status !== filter) {
        return false
      }
      
      // Filter by search (Franchise name or order ID)
      if (search.trim() !== "") {
        const query = search.toLowerCase()
        const orgName = (order.organizations?.name || "").toLowerCase()
        const orderId = order.id.toLowerCase()
        if (!orgName.includes(query) && !orderId.includes(query)) {
          return false
        }
      }
      
      return true
    })
  }, [orders, filter, search])

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-xl border border-zinc-200">
        <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-zinc-900">No orders yet</h3>
        <p className="text-zinc-500 text-sm">When franchises order student kits, they will appear here.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <Tabs defaultValue="ALL" value={filter} onValueChange={setFilter} className="w-full sm:w-auto overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full sm:w-auto h-10 items-center justify-center rounded-md bg-zinc-100 p-1 text-zinc-500">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="PENDING">Pending</TabsTrigger>
            <TabsTrigger value="ACCEPTED">Accepted</TabsTrigger>
            <TabsTrigger value="DISPATCHING">Dispatching</TabsTrigger>
            <TabsTrigger value="DELIVERED">Delivered</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isAdmin && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search franchise or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 bg-white border border-zinc-200 rounded-xl border-dashed">
            <p className="font-medium text-[15px]">No orders found for the current filters.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <KitOrderCard key={order.id} order={order} isAdmin={isAdmin} />
          ))
        )}
      </div>
    </div>
  )
}
