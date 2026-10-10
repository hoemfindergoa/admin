"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Loader2, PackagePlus } from "lucide-react"
import { toast } from "sonner"
import { placeStudentKitOrder } from "./actions"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"

interface KitOrderFormProps {
  orgId: string
  classes: { id: string, name: string }[]
}

export function KitOrderForm({ orgId, classes }: KitOrderFormProps) {
  const [items, setItems] = useState([{ id: Math.random().toString(), className: "", quantity: 1 }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customClass, setCustomClass] = useState<Record<string, boolean>>({})
  const [isOpen, setIsOpen] = useState(false)

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), className: "", quantity: 1 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id))
      const newCustomClass = { ...customClass }
      delete newCustomClass[id]
      setCustomClass(newCustomClass)
    }
  }

  const updateItem = (id: string, field: 'className' | 'quantity', value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const toggleCustomClass = (id: string) => {
    setCustomClass({ ...customClass, [id]: !customClass[id] })
    updateItem(id, 'className', '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (items.some(i => !i.className.trim() || i.quantity < 1)) {
      toast.error("Please fill all fields with valid data.")
      return
    }

    setIsSubmitting(true)
    try {
      await placeStudentKitOrder(orgId, items.map(i => ({ className: i.className, quantity: i.quantity })))
      toast.success("Order placed successfully!")
      setItems([{ id: Math.random().toString(), className: "", quantity: 1 }])
      setCustomClass({})
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2">
          <PackagePlus className="h-4 w-4" />
          Create Order
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto bg-zinc-50 p-0 flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="p-6 bg-white border-b border-zinc-100">
            <SheetTitle className="text-xl">Place New Order</SheetTitle>
            <SheetDescription>
              Select classes and quantity for student kits.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:items-end p-4 rounded-xl border border-zinc-200/60 bg-white shadow-sm hover:border-indigo-100 transition-colors">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Class / Grade</Label>
                  {customClass[item.id] || classes.length === 0 ? (
                    <Input
                      placeholder="e.g., Nursery"
                      value={item.className}
                      className="h-9"
                      onChange={(e) => updateItem(item.id, 'className', e.target.value)}
                    />
                  ) : (
                    <Select
                      value={item.className}
                      onValueChange={(val) => {
                        if (val === 'custom') {
                          toggleCustomClass(item.id)
                        } else {
                          updateItem(item.id, 'className', val)
                        }
                      }}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                        <SelectItem value="custom" className="font-semibold text-indigo-600">
                          + Enter custom class...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {classes.length > 0 && customClass[item.id] && (
                    <button
                      type="button"
                      onClick={() => toggleCustomClass(item.id)}
                      className="text-[10px] text-indigo-600 hover:underline font-medium uppercase tracking-wider"
                    >
                      Select from existing classes
                    </button>
                  )}
                </div>
                <div className="flex items-end gap-4">
                  <div className="w-24 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      className="h-9 font-semibold"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shrink-0"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-2 h-12 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl bg-white"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Class Kit
            </Button>
          </div>

          <SheetFooter className="p-6 bg-white border-t border-zinc-100 mt-auto">
            <Button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm text-sm font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
