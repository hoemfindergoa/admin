'use client'

import { useState, useTransition, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Bus, Map, Navigation, Route, Search, Plus, MapPin, Users, Settings, Activity } from 'lucide-react'
import { addVehicle } from '@/app/dashboard/[orgId]/transport/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type Vehicle = {
  id: string
  vehicle_number: string
  vehicle_model: string | null
  seating_capacity: number
  driver_name: string | null
  driver_phone: string | null
  gps_device_id: string | null
  status: string
}

export type TransportRoute = {
  id: string
  route_name: string
  vehicle_id: string | null
  start_point: string | null
  end_point: string | null
  distance_km: number | null
  monthly_fee: number
}

export function TransportWorkspace({ orgId, vehicles = [], routes = [], schemaReady = true }: { orgId: string; vehicles?: Vehicle[]; routes?: TransportRoute[]; schemaReady?: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  
  // Tabs: 'vehicles' | 'routes' | 'live'
  const [activeTab, setActiveTab] = useState<'vehicles' | 'routes' | 'live'>('vehicles')
  
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  function submitVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    
    startTransition(async () => {
      try {
        await addVehicle(orgId, formData)
        form.reset()
        setShowAddVehicle(false)
        toast.success('Vehicle added successfully.')
        router.refresh()
      } catch (cause) { 
        toast.error(cause instanceof Error ? cause.message : 'Could not save this vehicle.')
      }
    })
  }

  return <div className="space-y-6 max-w-[1600px] mx-auto">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Transport Manager</h1>
        <p className="mt-1 text-[14px] font-medium text-zinc-500">Manage vehicles, routes, and live GPS tracking.</p>
      </div>
    </div>
    
    {!schemaReady && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] font-semibold text-amber-800 shadow-sm">Please run schema_transport_update.sql in your Supabase SQL editor to enable the Transport database tables.</p>}
    
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
      {/* SIDEBAR */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-1">
        <div className="mb-4 px-2"><h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Transport Ops</h3></div>
        
        <button onClick={() => setActiveTab('vehicles')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'vehicles' ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <Bus className={cn("w-5 h-5", activeTab === 'vehicles' ? "text-amber-600" : "text-zinc-400")} /> Vehicles
        </button>
        
        <button onClick={() => setActiveTab('routes')} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'routes' ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <Route className={cn("w-5 h-5", activeTab === 'routes' ? "text-amber-600" : "text-zinc-400")} /> Routes & Stops
        </button>
        
        <button onClick={() => setActiveTab('live')} className={cn("flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all", activeTab === 'live' ? "bg-amber-50 text-amber-700 shadow-sm border border-amber-100" : "text-zinc-600 hover:bg-zinc-100")}>
          <div className="flex items-center gap-3">
            <Navigation className={cn("w-5 h-5", activeTab === 'live' ? "text-amber-600" : "text-zinc-400")} /> Live Tracking
          </div>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col relative">
        
        {/* VEHICLES TAB */}
        {activeTab === 'vehicles' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><Bus className="w-5 h-5 text-amber-600" /> Fleet Management</h2>
              <Button onClick={() => setShowAddVehicle(!showAddVehicle)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9">
                {showAddVehicle ? 'Cancel' : <><Plus className="w-4 h-4 mr-1" /> Add Vehicle</>}
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              {showAddVehicle ? (
                <Card className="border-amber-100 shadow-sm bg-amber-50/30 mb-6">
                  <CardHeader>
                    <CardTitle className="text-base">Register New Vehicle</CardTitle>
                    <CardDescription className="text-xs">Add a bus or van to your school's fleet.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={submitVehicle} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5"><Label className="text-xs font-bold text-zinc-700">Vehicle Number / License Plate <span className="text-red-500">*</span></Label><Input name="vehicle_number" required placeholder="e.g. MH-12-AB-1234" className="bg-white" /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-bold text-zinc-700">Model / Make</Label><Input name="vehicle_model" placeholder="e.g. Tata Magic / Swaraj Mazda" className="bg-white" /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-bold text-zinc-700">Seating Capacity</Label><Input name="seating_capacity" type="number" defaultValue="40" className="bg-white" /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-bold text-zinc-700">GPS Device ID (Future Integration)</Label><Input name="gps_device_id" placeholder="Optional device identifier" className="bg-white" /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-bold text-zinc-700">Driver Name</Label><Input name="driver_name" placeholder="Name of primary driver" className="bg-white" /></div>
                        <div className="space-y-1.5"><Label className="text-xs font-bold text-zinc-700">Driver Phone</Label><Input name="driver_phone" placeholder="Contact number" className="bg-white" /></div>
                      </div>
                      <Button type="submit" disabled={!schemaReady || pending} className="bg-amber-600 hover:bg-amber-700 text-white font-bold w-full md:w-auto">
                        {pending ? 'Saving...' : 'Save Vehicle'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : null}

              {vehicles.length === 0 ? (
                <div className="py-20 text-center text-zinc-400">
                  <Bus className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No vehicles registered yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map(v => (
                    <div key={v.id} className="border border-zinc-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all bg-white relative">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{v.status}</span>
                            {v.gps_device_id && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><Activity className="w-3 h-3"/> GPS Enabled</span>}
                          </div>
                          <h4 className="font-bold text-zinc-900 text-lg">{v.vehicle_number}</h4>
                          <p className="text-xs font-medium text-zinc-500">{v.vehicle_model || 'Unknown Model'} • {v.seating_capacity} Seats</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Driver</p>
                          <p className="font-medium text-zinc-800 truncate">{v.driver_name || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-zinc-400">Contact</p>
                          <p className="font-medium text-zinc-800 truncate">{v.driver_phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ROUTES TAB */}
        {activeTab === 'routes' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><Route className="w-5 h-5 text-amber-600" /> Routes & Stops</h2>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-9">
                <Plus className="w-4 h-4 mr-1" /> Create Route
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="py-20 text-center text-zinc-400">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Route planning UI goes here. You can assign vehicles to routes and set monthly fees.</p>
              </div>
            </div>
          </div>
        )}

        {/* LIVE TRACKING TAB */}
        {activeTab === 'live' && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><Navigation className="w-5 h-5 text-amber-600" /> Live GPS Tracking</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded">System Online</span>
              </div>
            </div>
            <div className="flex-1 relative bg-zinc-100">
              {/* Mock Map Background */}
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', backgroundSize: '100px' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="w-96 shadow-xl border-zinc-200">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-emerald-50">
                      <Map className="w-8 h-8 text-emerald-600" />
                    </div>
                    <CardTitle>GPS Integration Ready</CardTitle>
                    <CardDescription>
                      The fleet infrastructure has been built to support live tracking. Once physical GPS devices are installed in the vehicles and their Device IDs are registered in the system, live coordinates will appear here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" className="font-bold w-full" onClick={() => setActiveTab('vehicles')}>Manage Vehicle Device IDs</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  </div>
}
