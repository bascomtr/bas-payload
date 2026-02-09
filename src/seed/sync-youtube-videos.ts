/**
 * YouTube Video Sync Script
 * 
 * Extracts YouTube video IDs from WordPress product descriptions
 * and adds them to corresponding Payload CMS products.
 * 
 * Usage: npx tsx src/seed/sync-youtube-videos.ts
 */

const WP_API_URL = 'https://bas.com.tr/wp-json'
const WP_USERNAME = process.env.WP_USERNAME || 'bastr'
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'JfqV 53po HT9A Lr4z esiZ Ikc8'
const WP_AUTH = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'https://demo.bas.com.tr'
const PAYLOAD_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@bas.com.tr'
const PAYLOAD_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || 'BAS2026Admin!'

// ─── Helpers ───────────────────────────────────────────────

async function getPayloadToken(): Promise<string> {
  const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: PAYLOAD_EMAIL, password: PAYLOAD_PASSWORD }),
  })
  const data = await res.json() as { token?: string }
  if (!data.token) throw new Error('Failed to get Payload token')
  console.log('✓ Payload auth OK')
  return data.token
}

function extractYouTubeIds(html: string): string[] {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/g
  const ids = new Set<string>()
  let match
  while ((match = regex.exec(html)) !== null) {
    ids.add(match[1])
  }
  return Array.from(ids)
}

async function wpFetchAll(endpoint: string): Promise<unknown[]> {
  const results: unknown[] = []
  let page = 1
  while (true) {
    const sep = endpoint.includes('?') ? '&' : '?'
    const url = `${WP_API_URL}${endpoint}${sep}per_page=50&page=${page}`
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${WP_AUTH}` },
    })
    if (!res.ok) break
    const data = await res.json() as unknown[]
    if (!Array.isArray(data) || data.length === 0) break
    results.push(...data)
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1')
    if (page >= totalPages) break
    page++
  }
  return results
}

async function getYouTubeTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`)
    const data = await res.json() as { title?: string }
    return data.title || ''
  } catch {
    return ''
  }
}

// ─── Main ──────────────────────────────────────────────────

async function main() {
  console.log('=== YouTube Video Sync ===\n')

  // 1. Get all WP products
  console.log('Fetching WordPress products...')
  const wpProducts = await wpFetchAll('/wc/v3/products') as Array<{
    id: number
    slug: string
    name: string
    description: string
    short_description: string
  }>
  console.log(`  Found ${wpProducts.length} WP products`)

  // 2. Extract Turkish products with videos
  const trVideoMap: Record<string, { name: string; videoIds: string[] }> = {}

  // Known non-Turkish slug patterns to skip
  const foreignPatterns = [
    '%', // URL-encoded = Russian
    'recycling-plants', 'separators', 'beneficiation', 'magnetic-drum',
    'electromagnetic-', 'optical-separator', 'metal-detectors',
    'iron-steel', 'aluminium-', 'elevadores', 'instalaciones',
    'enriquecimiento', 'filtros', 'separadores', 'detectores',
  ]

  for (const wp of wpProducts) {
    const slug = wp.slug
    if (foreignPatterns.some(p => slug.includes(p))) continue

    const allHtml = (wp.description || '') + ' ' + (wp.short_description || '')
    const videoIds = extractYouTubeIds(allHtml)
    if (videoIds.length > 0) {
      trVideoMap[slug] = { name: wp.name, videoIds }
    }
  }

  console.log(`  ${Object.keys(trVideoMap).length} Turkish products have videos\n`)

  // 3. Auth to Payload
  const token = await getPayloadToken()

  // 4. Get all Payload products
  console.log('\nFetching Payload products...')
  const payloadRes = await fetch(`${PAYLOAD_URL}/api/products?limit=200&depth=0&locale=tr`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const payloadData = await payloadRes.json() as { docs: Array<{ id: number; slug: string; title: string; videos?: unknown[] }> }
  const payloadProducts = payloadData.docs
  console.log(`  Found ${payloadProducts.length} Payload products`)

  // Create slug -> id map
  const slugToPayloadId: Record<string, { id: number; title: string; hasVideos: boolean }> = {}
  for (const p of payloadProducts) {
    slugToPayloadId[p.slug] = {
      id: p.id,
      title: p.title,
      hasVideos: Array.isArray(p.videos) && p.videos.length > 0,
    }
  }

  // 5. Match and sync
  console.log('\n=== Syncing Videos ===\n')
  let synced = 0
  let skipped = 0
  let notFound = 0

  for (const [slug, { name, videoIds }] of Object.entries(trVideoMap)) {
    const payloadProduct = slugToPayloadId[slug]

    if (!payloadProduct) {
      console.log(`  ✗ Not found in Payload: ${name} (${slug})`)
      notFound++
      continue
    }

    if (payloadProduct.hasVideos) {
      console.log(`  ○ Already has videos: ${payloadProduct.title} (${videoIds.length} videos)`)
      skipped++
      continue
    }

    // Fetch YouTube titles
    console.log(`  → ${payloadProduct.title}: fetching ${videoIds.length} video titles...`)
    const videos = []
    for (const videoId of videoIds) {
      const title = await getYouTubeTitle(videoId)
      videos.push({ youtubeId: videoId, title: title || undefined })
      if (title) {
        console.log(`    ✓ ${videoId}: ${title}`)
      } else {
        console.log(`    ✓ ${videoId}: (no title)`)
      }
    }

    // PATCH the product
    const patchRes = await fetch(`${PAYLOAD_URL}/api/products/${payloadProduct.id}?locale=tr`, {
      method: 'PATCH',
      headers: {
        Authorization: `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videos }),
    })

    if (patchRes.ok) {
      console.log(`  ✓ Synced ${videos.length} videos to: ${payloadProduct.title}`)
      synced++
    } else {
      const err = await patchRes.text()
      console.log(`  ✗ Failed to sync: ${payloadProduct.title} - ${err.substring(0, 200)}`)
    }
  }

  console.log('\n=== Summary ===')
  console.log(`  Synced: ${synced}`)
  console.log(`  Skipped (already had videos): ${skipped}`)
  console.log(`  Not found in Payload: ${notFound}`)
  console.log('\nDone!')
}

main().catch(console.error)
