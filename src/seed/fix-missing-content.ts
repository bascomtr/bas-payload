/**
 * Fix Missing Content Migration Script
 *
 * Bu script:
 * 1. Bant Kantarı ürününü WordPress'ten çekip Payload'a oluşturur (görseller dahil)
 * 2. Alüminyum Geri Dönüşüm Tesisleri galeri görsellerini R2'ye yeniden yükler (404 fix)
 *
 * Kullanım:
 *   npx tsx src/seed/fix-missing-content.ts
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const WP_API_URL = 'https://bas.com.tr/wp-json'
const WP_USERNAME = process.env.WP_USERNAME || 'bastr'
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'JfqV 53po HT9A Lr4z esiZ Ikc8'
const PAYLOAD_API_URL =
  process.env.PAYLOAD_API_URL || 'https://bas-payload.young-wave-770a.workers.dev/api'
const PAYLOAD_EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@bas.com.tr'
const PAYLOAD_PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || 'BAS2026Admin!'

// WordPress auth header
const wpAuthHeader = `Basic ${Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')}`

// Temp directory for downloads
const TEMP_DIR = path.join(__dirname, '../../temp-media-fix')

// ============================================================
// HELPERS
// ============================================================

async function getAuthToken(): Promise<string> {
  console.log('  Logging in to Payload...')
  const response = await fetch(`${PAYLOAD_API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: PAYLOAD_EMAIL, password: PAYLOAD_PASSWORD }),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${await response.text()}`)
  }

  const data = (await response.json()) as { token: string }
  console.log('  Login successful')
  return data.token
}

async function downloadFile(url: string, outputPath: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`    Download failed (${response.status}): ${url}`)
      return false
    }

    const buffer = await response.arrayBuffer()
    fs.writeFileSync(outputPath, Buffer.from(buffer))
    return true
  } catch (error) {
    console.error(`    Download error: ${url}`, error)
    return false
  }
}

function getFilenameFromUrl(url: string): string {
  const urlPath = new URL(url).pathname
  return decodeURIComponent(urlPath.split('/').pop() || 'image.jpg')
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return mimeTypes[ext || ''] || 'image/jpeg'
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .trim()
}

function htmlToLexical(html: string): object {
  if (!html || html.trim() === '') {
    return {
      root: {
        type: 'root',
        children: [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  const cleanHtml = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div[^>]*>/g, '')
    .replace(/<\/div>/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const lines = cleanHtml.split('\n').filter((line) => line.trim())

  const paragraphs = lines.map((line) => ({
    type: 'paragraph',
    children: [{ type: 'text', text: line.trim() }],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }))

  if (paragraphs.length === 0) {
    paragraphs.push({
      type: 'paragraph',
      children: [{ type: 'text', text: '' }],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    })
  }

  return {
    root: {
      type: 'root',
      children: paragraphs,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/**
 * Upload a media file to Payload via REST API.
 * If the filename already exists, deletes the old record first (to fix 404s where
 * DB record exists but R2 file is missing).
 */
async function uploadMedia(
  token: string,
  sourceUrl: string,
  altText?: string,
  forceReupload = false,
): Promise<number | null> {
  const filename = getFilenameFromUrl(sourceUrl)
  const safeAlt = altText || filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

  try {
    // Check if already exists
    const checkResponse = await fetch(
      `${PAYLOAD_API_URL}/media?where[filename][equals]=${encodeURIComponent(filename)}&limit=1`,
      { headers: { Authorization: `JWT ${token}` } },
    )
    const checkData = (await checkResponse.json()) as { docs: Array<{ id: number }> }

    if (checkData.docs?.length > 0) {
      if (!forceReupload) {
        console.log(`    Already exists: ${filename} -> ${checkData.docs[0].id}`)
        return checkData.docs[0].id
      }

      // Delete old record so we can re-upload with fresh R2 file
      console.log(`    Deleting old media record: ${filename} (id: ${checkData.docs[0].id})`)
      await fetch(`${PAYLOAD_API_URL}/media/${checkData.docs[0].id}`, {
        method: 'DELETE',
        headers: { Authorization: `JWT ${token}` },
      })
    }

    // Download file
    const tempPath = path.join(TEMP_DIR, filename)
    console.log(`    Downloading: ${filename}`)
    const downloaded = await downloadFile(sourceUrl, tempPath)
    if (!downloaded) return null

    // Upload to Payload
    const fileBuffer = fs.readFileSync(tempPath)
    const blob = new Blob([fileBuffer], { type: getMimeType(filename) })

    const formData = new globalThis.FormData()
    formData.append('file', blob, filename)
    formData.append('_payload', JSON.stringify({ alt: safeAlt }))

    const response = await fetch(`${PAYLOAD_API_URL}/media`, {
      method: 'POST',
      headers: { Authorization: `JWT ${token}` },
      body: formData,
    })

    // Cleanup temp file
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)

    if (!response.ok) {
      const error = await response.text()
      console.error(`    Upload failed (${response.status}): ${error.slice(0, 200)}`)
      return null
    }

    const data = (await response.json()) as { doc: { id: number } }
    console.log(`    Uploaded: ${filename} -> ${data.doc.id}`)
    return data.doc.id
  } catch (error) {
    console.error(`    Error uploading ${filename}:`, error)
    return null
  }
}

// ============================================================
// TASK 1: Create Bant Kantarı product
// ============================================================

async function createBantKantari(token: string) {
  console.log('\n' + '='.repeat(60))
  console.log('TASK 1: Bant Kantarı Ürünü Oluşturma')
  console.log('='.repeat(60))

  // Check if already exists
  const checkResponse = await fetch(
    `${PAYLOAD_API_URL}/products?where[slug][equals]=bant-kantari&limit=1`,
    { headers: { Authorization: `JWT ${token}` } },
  )
  const checkData = (await checkResponse.json()) as { docs: Array<{ id: number }> }

  if (checkData.docs?.length > 0) {
    console.log('  Bant Kantarı already exists in Payload. Skipping creation.')
    return
  }

  // Fetch from WordPress
  console.log('  Fetching Bant Kantarı from WordPress API...')
  const wpResponse = await fetch(`${WP_API_URL}/wc/v3/products/3539`, {
    headers: { Authorization: wpAuthHeader },
  })
  const wpProduct = (await wpResponse.json()) as {
    id: number
    name: string
    slug: string
    description: string
    short_description: string
    images: Array<{ src: string; alt: string }>
    categories: Array<{ id: number; slug: string }>
  }

  console.log(`  Found: ${wpProduct.name} (${wpProduct.images.length} images)`)

  // Upload featured image (first image)
  console.log('\n  Uploading featured image...')
  let featuredImageId: number | null = null
  if (wpProduct.images.length > 0) {
    featuredImageId = await uploadMedia(token, wpProduct.images[0].src, wpProduct.images[0].alt)
  }

  // Upload gallery images (remaining images)
  console.log('\n  Uploading gallery images...')
  const galleryIds: number[] = []
  for (let i = 1; i < wpProduct.images.length; i++) {
    const img = wpProduct.images[i]
    const mediaId = await uploadMedia(token, img.src, img.alt)
    if (mediaId) galleryIds.push(mediaId)
  }

  // Payload category ID for "Metal Dedektörleri ve Bant Kantarları"
  const CATEGORY_ID = 16

  // Build product data
  const productData: Record<string, unknown> = {
    title: wpProduct.name,
    slug: wpProduct.slug,
    status: 'published',
    category: CATEGORY_ID,
    shortDescription: stripHtml(wpProduct.short_description),
    description: htmlToLexical(wpProduct.description),
  }

  if (featuredImageId) {
    productData.featuredImage = featuredImageId
  }

  if (galleryIds.length > 0) {
    productData.gallery = galleryIds.map((id) => ({ image: id }))
  }

  // Create product
  console.log('\n  Creating product in Payload...')
  const createResponse = await fetch(`${PAYLOAD_API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(productData),
  })

  if (!createResponse.ok) {
    const error = await createResponse.text()
    console.error(`  Failed to create Bant Kantarı: ${error.slice(0, 300)}`)
    return
  }

  const created = (await createResponse.json()) as { doc: { id: number; slug: string } }
  console.log(`  ✓ Bant Kantarı created successfully! ID: ${created.doc.id}`)
}

// ============================================================
// TASK 2: Fix Alüminyum Geri Dönüşüm gallery 404s
// ============================================================

async function fixAluminumGallery(token: string) {
  console.log('\n' + '='.repeat(60))
  console.log('TASK 2: Alüminyum Geri Dönüşüm Galeri 404 Fix')
  console.log('='.repeat(60))

  // The 3 gallery images that return 404 and their WordPress source URLs
  const missingImages = [
    {
      payloadMediaId: 7,
      filename: 'aluminum-scrap-recycling-2.jpg',
      wpUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/aluminum-scrap-recycling-2.jpg',
      alt: 'aluminum scrap recycling 2',
    },
    {
      payloadMediaId: 8,
      filename: 'aluminyum-geri-donusum-tesisi-scaled.jpeg',
      wpUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/aluminyum-geri-donusum-tesisi-scaled.jpeg',
      alt: 'aluminyum geri donusum tesisi',
    },
    {
      payloadMediaId: 9,
      filename: 'IMG-20250213-WA0083-scaled.jpg',
      wpUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/IMG-20250213-WA0083-scaled.jpg',
      alt: 'IMG-20250213-WA0083',
    },
  ]

  const PRODUCT_ID = 3 // Alüminyum Geri Dönüşüm Tesisleri

  // Re-upload each missing image (delete old DB record, upload fresh)
  const newMediaIds: Record<number, number> = {} // old ID -> new ID

  for (const img of missingImages) {
    console.log(`\n  Fixing: ${img.filename} (old ID: ${img.payloadMediaId})`)
    const newId = await uploadMedia(token, img.wpUrl, img.alt, true)

    if (newId) {
      newMediaIds[img.payloadMediaId] = newId
      console.log(`    ✓ Re-uploaded: ${img.filename} -> new ID: ${newId}`)
    } else {
      console.error(`    ✗ Failed to re-upload: ${img.filename}`)
    }
  }

  // Now update the product gallery with new media IDs
  if (Object.keys(newMediaIds).length > 0) {
    console.log('\n  Updating product gallery references...')

    // Fetch current product with depth=0 to get raw IDs (avoids null populate for deleted records)
    const productResponse = await fetch(`${PAYLOAD_API_URL}/products/${PRODUCT_ID}?depth=0`, {
      headers: { Authorization: `JWT ${token}` },
    })
    const product = (await productResponse.json()) as {
      gallery: Array<{ id?: string; image: number | null; caption?: string }>
    }

    console.log(`  Current gallery items: ${product.gallery?.length || 0}`)

    // Rebuild gallery: replace old deleted IDs with new ones, keep working ones
    const updatedGallery = (product.gallery || [])
      .map((item) => {
        const imageId = item.image
        // If this image was one of the deleted ones, replace with new ID
        if (imageId && newMediaIds[imageId]) {
          console.log(`    Replacing media ${imageId} -> ${newMediaIds[imageId]}`)
          return { image: newMediaIds[imageId] }
        }
        // If image is null (deleted and not in our map), skip it
        if (!imageId) {
          console.log('    Skipping null gallery item')
          return null
        }
        // Keep existing working images
        return { image: imageId }
      })
      .filter(Boolean)

    console.log(`  Updated gallery items: ${updatedGallery.length}`)

    const updateResponse = await fetch(`${PAYLOAD_API_URL}/products/${PRODUCT_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({ gallery: updatedGallery }),
    })

    if (updateResponse.ok) {
      console.log('  ✓ Product gallery updated successfully!')
    } else {
      const error = await updateResponse.text()
      console.error(`  ✗ Failed to update gallery: ${error.slice(0, 300)}`)
    }
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('='.repeat(60))
  console.log('Fix Missing Content - WordPress -> Payload Migration')
  console.log('='.repeat(60))
  console.log(`Payload API: ${PAYLOAD_API_URL}`)
  console.log(`WordPress API: ${WP_API_URL}`)

  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }

  // Get auth token
  console.log('\n🔐 Authenticating...')
  const token = await getAuthToken()

  // Run tasks
  await createBantKantari(token)
  await fixAluminumGallery(token)

  // Cleanup
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true })
  }

  console.log('\n' + '='.repeat(60))
  console.log('All tasks completed!')
  console.log('='.repeat(60))
}

main().catch((error) => {
  console.error('\nMigration failed:', error)
  process.exit(1)
})
