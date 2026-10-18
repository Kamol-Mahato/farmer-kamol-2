// app/api/indexnow/route.ts - Fixed for Next.js 15
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const INDEXNOW_KEY = '2b0cedfffbe24595abd6a2f368dd5fb9'
const ADMIN_EMAILS = ['kamol@farmerkamol.com', 'contact@farmerkamol.com']

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // API route এ set করার দরকার নেই
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'আপনি লগইন করেননি।' }, { status: 401 })
  }

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    return Response.json({ error: 'আপনি অ্যাডমিন নন।' }, { status: 403 })
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
}