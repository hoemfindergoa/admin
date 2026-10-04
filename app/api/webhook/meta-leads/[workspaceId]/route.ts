import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import crypto from 'crypto'

// 1. GET Handler for Meta Webhook Verification
export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // You will set this token in your .env and provide the same one to Meta
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED')
    return new NextResponse(challenge, { status: 200 })
  } else {
    return new NextResponse('Forbidden', { status: 403 })
  }
}

// 2. POST Handler to receive new leads
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    
    // Get the raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const appSecret = process.env.META_APP_SECRET

    // Verify the request came from Meta (optional but highly recommended for security)
    if (appSecret && signature) {
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex')}`

      if (signature !== expectedSignature) {
        console.error('Invalid Meta Signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(rawBody)

    // Check if this is a page object
    if (payload.object !== 'page') {
      return new NextResponse('Not Found', { status: 404 })
    }

    const adminClient = createAdminClient()
    const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN

    if (!pageAccessToken) {
      console.error('Missing META_PAGE_ACCESS_TOKEN')
      return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
    }

    // Process all entries and changes
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id
          
          // 3. Fetch actual lead details from Graph API
          const metaResponse = await fetch(
            `https://graph.facebook.com/v19.0/${leadgenId}?access_token=${pageAccessToken}`
          )
          const leadData = await metaResponse.json()

          if (leadData.error) {
            console.error('Error fetching lead data from Meta:', leadData.error)
            continue
          }

          // Meta sends fields as an array of objects: [{ name: "email", values: ["test@test.com"] }, ...]
          const fields: Record<string, string> = {}
          leadData.field_data.forEach((field: any) => {
            fields[field.name] = field.values[0]
          })

          // Extract standard fields (adjust these based on your actual Meta Lead Form fields)
          const contactName = fields.full_name || fields.first_name || 'Unknown User'
          const email = fields.email || null
          const phone = fields.phone_number || null
          const city = fields.city || null

          // 4. Save to our database
          const { error } = await adminClient.from('crm_leads').insert({
            crm_workspace_id: workspaceId,
            contact_name: contactName,
            company_name: contactName, // Required fallback
            email: email,
            phone: phone,
            city_location: city,
            source: 'Meta Ads',
            status: 'NEW',
          })

          if (error) {
            console.error('Error inserting Meta lead into Supabase:', error)
          } else {
            console.log(`Successfully imported Meta Lead: ${leadgenId}`)
          }
        }
      }
    }

    // Always return a 200 OK to Meta immediately so they know we received it
    return NextResponse.json({ success: true }, { status: 200 })

  } catch (error: any) {
    console.error('Meta Webhook POST Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
