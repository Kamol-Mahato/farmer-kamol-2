// app/api/indexnow/route.ts - Final for your keys
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const INDEXNOW_KEY = '2b0cedfffbe24595abd6a2f368dd5fb9'

export async function GET() {
  try {
    const cookieStore = await cookies()

    // আপনার Render এর নাম অনুযায়ী
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'আপনি লগইন করেননি।' }, { status: 401 })
    }

    const { data: products } = await supabase.from('products').select('slug')
    const urls = [
      'https://farmerkamol.com/',
      'https://farmerkamol.com/invest',
      ...(products?.map(p => `https://farmerkamol.com/shop/${p.slug}`) || [])
    ]

    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'farmerkamol.com',
        key: INDEXNOW_KEY,
        keyLocation: `https://farmerkamol.com/${INDEXNOW_KEY}.txt`,
        urlList: urls
      })
    })

    return Response.json({ success: true, submitted: urls.length })
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}