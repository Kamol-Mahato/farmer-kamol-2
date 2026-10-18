// app/api/indexnow/route.ts - Phone Login Protected
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const INDEXNOW_KEY = '2b0cedfffbe24595abd6a2f368dd5fb9'

export async function GET() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'আপনি লগইন করেননি। আগে admin হিসেবে লগইন করুন।' }, { status: 401 })
    }

    // আপনার নাম্বার দিয়ে চেক - 2 ফরম্যাটেই চেক করবে
    const adminPhones = ['01737939688', '+8801737939688', '8801737939688']
    const userPhone = user.phone || user.user_metadata?.phone || ''

    // যদি ইমেইল দিয়েও অ্যাডমিন হয়ে থাকেন, সেটাও চেক করবে
    const isAdmin = adminPhones.includes(userPhone) || user.email === 'contact@farmerkamol.com'

    if (!isAdmin) {
      return Response.json({ error: `আপনি অ্যাডমিন নন। আপনার লগইন: ${userPhone || user.email}` }, { status: 403 })
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
    return Response.json({ error: 'Server Error', details: e.message }, { status: 500 })
  }
}