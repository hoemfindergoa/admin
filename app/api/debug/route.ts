import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET() {
  const admin = createAdminClient()
  const { data: orgs } = await admin.from('organizations').select('*')
  const { data: workspaces } = await admin.from('crm_workspaces').select('*')
  const { data: profiles } = await admin.from('profiles').select('*')
  
  return NextResponse.json({
    orgs,
    workspaces,
    profiles
  })
}
