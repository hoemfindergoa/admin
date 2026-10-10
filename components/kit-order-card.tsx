"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building, Package, Truck, CheckCircle2, IndianRupee, Clock, Receipt, CreditCard, Copy, Printer, Zap } from "lucide-react"
import { updateOrderStatus, acceptOrderWithPricing, updatePaymentDetails } from "@/app/dashboard/student-kits/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function KitOrderCard({ order, isAdmin = true }: { order: any, isAdmin?: boolean }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [prices, setPrices] = useState<Record<string, number>>(
    order.items?.reduce((acc: any, item: any) => ({ ...acc, [item.id]: item.unit_price || 1500 }), {}) || {}
  )
  const [transactionId, setTransactionId] = useState(order.transaction_id || "")
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateOrderStatus(order.id, newStatus)
      toast.success(`Order marked as ${newStatus}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAcceptPricing = async () => {
    setIsUpdating(true)
    try {
      let totalAmount = 0
      const itemPrices = order.items.map((item: any) => {
        const unitPrice = prices[item.id] || 0
        const totalPrice = unitPrice * item.quantity
        totalAmount += totalPrice
        return { id: item.id, unit_price: unitPrice, total_price: totalPrice }
      })

      await acceptOrderWithPricing(order.id, itemPrices, totalAmount)
      toast.success("Order accepted and invoice generated.")
    } catch (error: any) {
      toast.error(error.message || "Failed to accept order")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSubmitPayment = async () => {
    if (!transactionId.trim()) {
      toast.error("Please enter a transaction ID")
      return
    }
    setIsUpdating(true)
    try {
      await updatePaymentDetails(order.id, transactionId)
      toast.success("Payment details updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment details")
    } finally {
      setIsUpdating(false)
    }
  }

  const quickSetPrices = (amount: number) => {
    const newPrices = { ...prices }
    order.items?.forEach((item: any) => {
      newPrices[item.id] = amount
    })
    setPrices(newPrices)
    toast.success(`All items set to ₹${amount.toLocaleString('en-IN')}`)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const handlePrint = () => {
    const printContent = document.getElementById(`invoice-${order.id}`)
    if (printContent) {
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContent.innerHTML
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload() // Reload to restore event listeners after innerHTML swap
    }
  }

  const steps = [
    { id: 'PENDING', label: 'Ordered', icon: Package },
    { id: 'ACCEPTED', label: 'Invoice Sent', icon: Receipt },
    { id: 'DISPATCHING', label: 'Dispatching', icon: Truck },
    { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === order.status) >= 0 
    ? steps.findIndex(s => s.id === order.status) 
    : (order.status === 'CANCELLED' ? -1 : 0)

  const totalAmount = order.total_amount || 0
  const totalKits = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
  const isPaid = order.payment_status === 'PAID'

  return (
    <Card className="overflow-hidden border-zinc-200/80 shadow-sm hover:shadow-md transition-all group">
      <CardHeader className="bg-zinc-50/80 border-b border-zinc-100 py-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 space-y-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-[14px] text-zinc-900">{order.organizations?.name || 'Unknown Franchise'}</span>
          </div>
          <CardDescription className="text-xs flex items-center gap-2 text-zinc-500 font-medium">
            <span className="bg-zinc-200/50 text-zinc-700 px-1.5 py-0.5 rounded font-mono cursor-pointer hover:bg-zinc-300 transition-colors" onClick={() => copyToClipboard(order.id, 'Order ID')}>
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mounted ? new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Loading...'}</span>
          </CardDescription>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {order.status !== 'PENDING' && (
            <div className="flex flex-col items-end mr-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Total Value</span>
              <span className="text-[14px] font-bold text-emerald-600 flex items-center">
                <IndianRupee className="h-3 w-3 mr-0.5" />
                {Number(totalAmount).toLocaleString('en-IN')}
              </span>
            </div>
          )}
          {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
            <Badge 
              variant="outline" 
              className={cn(
                "px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] border-2 shadow-sm",
                isPaid ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-rose-200 text-rose-700 bg-rose-50'
              )}
            >
              {isPaid ? 'PAID' : 'PAYMENT PENDING'}
            </Badge>
          )}
          <Badge 
            variant="outline" 
            className={cn(
              "px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] border-2 shadow-sm",
              order.status === 'PENDING' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
              order.status === 'ACCEPTED' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' : 
              order.status === 'DISPATCHING' ? 'border-blue-200 text-blue-700 bg-blue-50' : 
              order.status === 'DELIVERED' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 
              'border-red-200 text-red-700 bg-red-50'
            )}
          >
            {order.status}
          </Badge>

          {/* Invoice Dialog */}
          {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
            <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2 ml-1 text-xs gap-1">
                  <Receipt className="h-3 w-3" />
                  Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-zinc-50">
                <div id={`invoice-${order.id}`} className="p-8 bg-white text-zinc-900">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-indigo-600 mb-1">DHEERAJ PLAYSCHOOL</h2>
                      <p className="text-sm text-zinc-500 font-medium">Student Kits Invoice</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg mb-1">{order.organizations?.name}</p>
                      <p className="text-xs text-zinc-500">Order ID: #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-zinc-500">Date: {mounted ? new Date(order.created_at).toLocaleDateString() : '...'}</p>
                      <Badge variant="outline" className={cn("mt-2 text-[10px]", isPaid ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-rose-200 text-rose-700 bg-rose-50")}>
                        {isPaid ? 'PAID' : 'PAYMENT PENDING'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border border-zinc-200 rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-bold text-zinc-600 uppercase text-[10px] tracking-wider">Item Details</th>
                          <th className="text-center py-3 px-4 font-bold text-zinc-600 uppercase text-[10px] tracking-wider">Qty</th>
                          <th className="text-right py-3 px-4 font-bold text-zinc-600 uppercase text-[10px] tracking-wider">Unit Price</th>
                          <th className="text-right py-3 px-4 font-bold text-zinc-600 uppercase text-[10px] tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {order.items?.map((item: any) => (
                          <tr key={item.id}>
                            <td className="py-3 px-4 font-medium">{item.class_name} Student Kit</td>
                            <td className="py-3 px-4 text-center">{item.quantity}</td>
                            <td className="py-3 px-4 text-right">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-right font-semibold text-zinc-900">₹{Number(item.total_price).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end mb-8">
                    <div className="w-64">
                      <div className="flex justify-between py-2 border-b border-zinc-100">
                        <span className="text-sm font-medium text-zinc-500">Subtotal</span>
                        <span className="text-sm font-semibold">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-base font-bold text-zinc-900">Total Amount</span>
                        <span className="text-lg font-black text-indigo-600">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isPaid && order.transaction_id && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Payment Completed
                      </p>
                      <p className="text-xs text-emerald-600">Transaction ID: <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">{order.transaction_id}</span></p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsInvoiceOpen(false)}>Close</Button>
                  <Button onClick={handlePrint} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <Printer className="h-4 w-4" /> Print / Download PDF
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Progress Tracker (Compact) */}
        {order.status !== 'CANCELLED' && (
          <div className="px-4 py-4 border-b border-zinc-100 bg-white hidden sm:block">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 rounded-full" />
              <div 
                className="absolute top-1/2 left-0 h-1 bg-indigo-500 -translate-y-1/2 rounded-full transition-all duration-500"
                style={{ width: `${currentStepIndex === 0 ? 0 : currentStepIndex === 1 ? 33 : currentStepIndex === 2 ? 66 : 100}%` }}
              />
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-1.5 bg-white px-2">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors",
                        isCompleted ? "border-indigo-500 bg-indigo-50 text-indigo-600" : "border-zinc-200 bg-zinc-50 text-zinc-400",
                        isCurrent && "ring-4 ring-indigo-500/20"
                      )}>
                        <step.icon className="h-4 w-4" />
                      </div>
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider",
                        isCompleted ? "text-zinc-900" : "text-zinc-400"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-zinc-50/40 flex flex-col lg:flex-row gap-5">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Order Items ({totalKits} Kits)</h4>
              {isAdmin && order.status === 'PENDING' && (
                <Button variant="ghost" size="sm" onClick={() => quickSetPrices(1500)} className="h-6 px-2 text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  <Zap className="h-3 w-3 mr-1" /> Quick set ₹1,500
                </Button>
              )}
            </div>
            
            <ul className="space-y-2">
              {order.items?.map((item: any) => (
                <li key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-zinc-200/60 bg-white shadow-sm gap-2">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="h-7 w-7 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Package className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-[13px] text-zinc-900 leading-none">{item.class_name}</span>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Student Kit • Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    {isAdmin && order.status === 'PENDING' ? (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <Label className="text-[10px] font-bold uppercase text-zinc-400 shrink-0">Price (₹)</Label>
                        <Input 
                          type="number" 
                          className="w-20 h-7 text-xs font-semibold"
                          value={prices[item.id] || ""}
                          onChange={(e) => setPrices({...prices, [item.id]: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    ) : order.status !== 'PENDING' ? (
                      <div className="text-right">
                        <div className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5">Subtotal</div>
                        <span className="font-bold text-[13px] text-zinc-800 flex items-center justify-end">
                          <IndianRupee className="h-3 w-3 mr-0.5" />
                          {Number(item.total_price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <div className="text-right text-[10px] text-amber-600 font-bold uppercase bg-amber-50 px-2 py-1 rounded border border-amber-100">
                        Pending
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full lg:w-56 flex flex-col gap-3">
            {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
              <div className={cn("p-3 rounded-lg border shadow-sm transition-colors", isPaid ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-zinc-200")}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Payment Details
                </h4>
                {isPaid ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Paid Successfully
                    </p>
                    {order.transaction_id && (
                      <p className="text-[11px] text-zinc-600 mt-1 flex items-center gap-1">
                        Txn: <span className="font-mono bg-white border border-emerald-200 px-1 py-0.5 rounded text-emerald-800">{order.transaction_id}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => copyToClipboard(order.transaction_id, 'Transaction ID')}>
                          <Copy className="h-3 w-3 text-zinc-400" />
                        </Button>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase text-zinc-500">Transaction ID</Label>
                      <Input 
                        placeholder="e.g. UTR Number" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="h-7 text-xs bg-zinc-50"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full h-7 text-xs bg-zinc-800 hover:bg-zinc-900 text-white"
                      disabled={isUpdating || !transactionId.trim()}
                      onClick={handleSubmitPayment}
                    >
                      Submit Payment
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(isAdmin || order.status === 'PENDING') && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                  {isAdmin ? "Admin Actions" : "Actions"}
                </h4>
                {isAdmin && order.status === 'PENDING' && (
                  <Button 
                    onClick={handleAcceptPricing} 
                    disabled={isUpdating}
                    size="sm"
                    className="w-full h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  >
                    Accept & Generate Invoice
                  </Button>
                )}
                {isAdmin && order.status === 'ACCEPTED' && (
                  <Button 
                    onClick={() => handleUpdateStatus('DISPATCHING')} 
                    disabled={isUpdating}
                    size="sm"
                    className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Mark as Dispatching
                  </Button>
                )}
                {isAdmin && order.status === 'DISPATCHING' && (
                  <Button 
                    onClick={() => handleUpdateStatus('DELIVERED')} 
                    disabled={isUpdating}
                    size="sm"
                    className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Mark as Delivered
                  </Button>
                )}
                {order.status === 'PENDING' && (
                  <Button 
                    onClick={() => handleUpdateStatus('CANCELLED')} 
                    disabled={isUpdating}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    Cancel Order
                  </Button>
                )}
                {isAdmin && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'PENDING' && (
                  <Button 
                    onClick={() => handleUpdateStatus('CANCELLED')} 
                    disabled={isUpdating}
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-[10px] uppercase font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 mt-2"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
