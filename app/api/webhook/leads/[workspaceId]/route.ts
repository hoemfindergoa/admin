import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()

    const {
      company_name,
      contact_name,
      email,
      phone,
      source,
      notes,
      city_location,
      investment_budget,
      owns_property,
    } = payload

    // Basic validation
    if (!contact_name) {
      return NextResponse.json({ error: 'contact_name is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: newLead, error } = await adminClient.from('crm_leads').insert({
      crm_workspace_id: workspaceId,
      company_name: company_name || contact_name, // Fallback if no company name
      contact_name: contact_name,
      email: email || null,
      phone: phone || null,
      source: source || 'API Webhook',
      status: 'NEW',
      notes: notes || null,
      city_location: city_location || null,
      investment_budget: investment_budget || null,
      owns_property: owns_property || null,
    }).select('id, company_name').single()

    if (error) {
      console.error('Error inserting lead via webhook:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
