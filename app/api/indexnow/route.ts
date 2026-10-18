// app/api/indexnow/route.ts - Secret Protected ( আপনার লগইনের জন্য এটাই সঠিক )
import { createClient } from '@supabase/supabase-js'

const INDEXNOW_KEY = '2b0cedfffbe24595abd6a2f368dd5fb9'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  // আপনার নিজের গোপন কোড - শুধু আপনি জানবেন
  if (secret !== 'kamol123') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

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