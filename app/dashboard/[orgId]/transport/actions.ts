'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getTransportAccess(orgId: string) {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in to continue.')
  
  const [{ data: org }, { data: member }] = await Promise.all([
    supabase.from('organizations').select('owner_id').eq('id', orgId).maybeSingle(),
    supabase.from('organization_users').select('role, permissions, status').eq('org_id', orgId).eq('user_id', user.id).maybeSingle(),
  ])
  
  const allowed = org?.owner_id === user.id || (member?.status === 'ACTIVE' && (
    member.role === 'FRANCHISE_ADMIN' || (Array.isArray(member.permissions) && member.permissions.includes('transport'))
  ))
  
  if (!allowed) throw new Error('You do not have permission to manage transport.')
  return { supabase, user }
}

export async function getTransportWorkspace(orgId: string) {
  await getTransportAccess(orgId)
  const admin = createAdminClient()
  
  const [{ data: vehicles, error: vError }, { data: routes, error: rError }] = await Promise.all([
    admin.from('school_vehicles').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
    admin.from('school_transport_routes').select('*').eq('org_id', orgId).order('route_name', { ascending: true })
  ])
  
  // If tables don't exist yet, return empty arrays but flag that ledger/tables aren't ready
  if (vError || rError) {
    return { vehicles: [], routes: [], schemaReady: false }
  }
  
  return { 
    vehicles: vehicles ?? [], 
    routes: routes ?? [],
    schemaReady: true
  }
}

export async function addVehicle(orgId: string, formData: FormData) {
  const { supabase } = await getTransportAccess(orgId)
  
  const vehicleNumber = String(formData.get('vehicle_number') ?? '').trim()
  const vehicleModel = String(formData.get('vehicle_model') ?? '').trim()
  const seatingCapacity = parseInt(String(formData.get('seating_capacity') ?? '0'), 10)
  const driverName = String(formData.get('driver_name') ?? '').trim()
  const driverPhone = String(formData.get('driver_phone') ?? '').trim()
  const gpsDeviceId = String(formData.get('gps_device_id') ?? '').trim()
  const status = String(formData.get('status') ?? 'ACTIVE')

  if (!vehicleNumber) throw new Error('Vehicle number is required.')

  const { error } = await supabase.from('school_vehicles').insert({
    org_id: orgId,
    vehicle_number: vehicleNumber,
    vehicle_model: vehicleModel || null,
    seating_capacity: isNaN(seatingCapacity) ? 0 : seatingCapacity,
    driver_name: driverName || null,
    driver_phone: driverPhone || null,
    gps_device_id: gpsDeviceId || null,
    status
  })

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/${orgId}/transport`)
}
