/**
 * Sync R2 media to Production Payload via HTTP API
 * 
 * This script:
 * 1. Downloads images from WordPress
 * 2. Uploads to Production Payload API (which stores in R2)
 * 3. Updates products with correct media references
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const WP_BASE_URL = 'https://bas.com.tr'
const WP_API_URL = `${WP_BASE_URL}/wp-json`
const WP_USERNAME = process.env.WP_USERNAME || 'bastr'
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'JfqV 53po HT9A Lr4z esiZ Ikc8'
const PAYLOAD_API_URL = 'https://bas-payload.young-wave-770a.workers.dev/api'

// Get fresh token
async function getAuthToken(): Promise<string> {
  const response = await fetch(`${PAYLOAD_API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@bas.com.tr',
      password: 'BAS2026Admin!'
    })
  })
  
  const data = await response.json() as { token: string }
  return data.token
}

// WordPress auth header
const wpAuthHeader = `Basic ${Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')}`

// Temp directory for downloads
const TEMP_DIR = path.join(__dirname, '../../temp-media')
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

// Download file from URL
async function downloadFile(url: string, outputPath: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    if (!response.ok) return false
    
    const buffer = await response.arrayBuffer()
    fs.writeFileSync(outputPath, Buffer.from(buffer))
    return true
  } catch {
    return false
  }
}

// Get filename from URL
function getFilenameFromUrl(url: string): string {
  const urlPath = new URL(url).pathname
  return decodeURIComponent(urlPath.split('/').pop() || 'image.jpg')
}

// Upload media to Payload via HTTP using Blob
async function uploadMediaToPayload(
  token: string,
  filePath: string,
  filename: string,
  altText: string
): Promise<number | null> {
  try {
    // Check if already exists
    const checkResponse = await fetch(
      `${PAYLOAD_API_URL}/media?where[filename][equals]=${encodeURIComponent(filename)}&limit=1`,
      { headers: { Authorization: `JWT ${token}` } }
    )
    const checkData = await checkResponse.json() as { docs: Array<{ id: number }> }
    
    if (checkData.docs?.length > 0) {
      console.log(`    Already exists: ${filename} -> ${checkData.docs[0].id}`)
      return checkData.docs[0].id
    }
    
    // Read file as buffer and create Blob
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer], { type: getMimeType(filename) })
    
    // Create native FormData - ensure alt is never empty
    // Payload expects _payload field with JSON data
    const safeAltText = altText || filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    const formData = new globalThis.FormData()
    formData.append('file', blob, filename)
    formData.append('_payload', JSON.stringify({ alt: safeAltText }))
    
    const response = await fetch(`${PAYLOAD_API_URL}/media`, {
      method: 'POST',
      headers: {
        Authorization: `JWT ${token}`
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`    Upload failed: ${error}`)
      return null
    }
    
    const data = await response.json() as { doc: { id: number } }
    console.log(`    Uploaded: ${filename} -> ${data.doc.id}`)
    return data.doc.id
  } catch (error) {
    console.error(`    Error uploading ${filename}:`, error)
    return null
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml'
  }
  return mimeTypes[ext || ''] || 'image/jpeg'
}

// Update product with media
async function updateProductMedia(
  token: string,
  productId: number,
  featuredImageId: number | null,
  galleryIds: number[]
): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {}
    
    if (featuredImageId) {
      updateData.featuredImage = featuredImageId
    }
    
    if (galleryIds.length > 0) {
      updateData.gallery = galleryIds.map(id => ({ image: id }))
    }
    
    if (Object.keys(updateData).length === 0) return
    
    const response = await fetch(`${PAYLOAD_API_URL}/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`
      },
      body: JSON.stringify(updateData)
    })
    
    if (!response.ok) {
      console.error(`  Failed to update product ${productId}`)
    }
  } catch (error) {
    console.error(`  Error updating product ${productId}:`, error)
  }
}

// Main sync function
async function syncMedia() {
  console.log('============================================================')
  console.log('Media Sync to Production')
  console.log('============================================================')
  
  // Get auth token
  console.log('\n🔐 Getting auth token...')
  const token = await getAuthToken()
  console.log('✓ Token obtained')
  
  // Fetch products from WordPress
  console.log('\n📦 Fetching products from WordPress...')
  const wpProducts: Array<{
    id: number
    name: string
    slug: string
    images: Array<{ src: string; alt: string }>
    lang: string
  }> = []
  
  let page = 1
  while (true) {
    const response = await fetch(
      `${WP_API_URL}/wc/v3/products?per_page=100&page=${page}`,
      { headers: { Authorization: wpAuthHeader } }
    )
    const products = await response.json() as typeof wpProducts
    if (!products.length) break
    wpProducts.push(...products)
    page++
  }
  
  // Filter Turkish products
  const trProducts = wpProducts.filter(p => p.lang === 'tr' || !p.lang)
  console.log(`Found ${trProducts.length} Turkish products`)
  
  // Get existing Payload products
  console.log('\n📋 Fetching Payload products...')
  const payloadResponse = await fetch(`${PAYLOAD_API_URL}/products?limit=100`, {
    headers: { Authorization: `JWT ${token}` }
  })
  const payloadData = await payloadResponse.json() as {
    docs: Array<{ id: number; slug: string; featuredImage: unknown }>
  }
  const payloadProducts = payloadData.docs
  console.log(`Found ${payloadProducts.length} Payload products`)
  
  // Create slug -> Payload ID map
  const slugToPayloadId = new Map<string, number>()
  payloadProducts.forEach(p => slugToPayloadId.set(p.slug, p.id))
  
  // Process each WordPress product
  console.log('\n🖼️  Syncing media...')
  let updated = 0
  let skipped = 0
  
  for (const wpProduct of trProducts) { // Process all products
    const payloadId = slugToPayloadId.get(wpProduct.slug.replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ç/g, 'c'))
    
    if (!payloadId) {
      console.log(`  Skip: ${wpProduct.name} (no matching Payload product)`)
      skipped++
      continue
    }
    
    if (wpProduct.images.length === 0) {
      console.log(`  Skip: ${wpProduct.name} (no images)`)
      skipped++
      continue
    }
    
    console.log(`\n  Processing: ${wpProduct.name}`)
    
    // Download and upload featured image
    let featuredImageId: number | null = null
    if (wpProduct.images[0]) {
      const img = wpProduct.images[0]
      const filename = getFilenameFromUrl(img.src)
      const tempPath = path.join(TEMP_DIR, filename)
      
      console.log(`    Downloading: ${filename}`)
      const downloaded = await downloadFile(img.src, tempPath)
      
      if (downloaded) {
        featuredImageId = await uploadMediaToPayload(token, tempPath, filename, img.alt || filename)
        fs.unlinkSync(tempPath)
      }
    }
    
    // Download and upload gallery images
    const galleryIds: number[] = []
    for (let i = 1; i < Math.min(wpProduct.images.length, 10); i++) {
      const img = wpProduct.images[i]
      const filename = getFilenameFromUrl(img.src)
      const tempPath = path.join(TEMP_DIR, filename)
      
      console.log(`    Downloading gallery: ${filename}`)
      const downloaded = await downloadFile(img.src, tempPath)
      
      if (downloaded) {
        const mediaId = await uploadMediaToPayload(token, tempPath, filename, img.alt || filename)
        if (mediaId) galleryIds.push(mediaId)
        fs.unlinkSync(tempPath)
      }
    }
    
    // Update product
    if (featuredImageId || galleryIds.length > 0) {
      console.log(`    Updating product ${payloadId}...`)
      await updateProductMedia(token, payloadId, featuredImageId, galleryIds)
      updated++
    }
  }
  
  console.log('\n============================================================')
  console.log('Sync Complete!')
  console.log('============================================================')
  console.log(`Products updated: ${updated}`)
  console.log(`Products skipped: ${skipped}`)
  
  // Cleanup temp dir
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true })
  }
}

syncMedia().catch(console.error)
