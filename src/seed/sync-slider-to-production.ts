/**
 * Sync WordPress Slider to Production Payload
 * Downloads slider images and creates Homepage slider data
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const PAYLOAD_API_URL = 'https://bas-payload.young-wave-770a.workers.dev/api'
const PRODUCTION_URL = 'https://bas-payload.young-wave-770a.workers.dev'

// WordPress slider data (from previous API call)
const SLIDER_DATA = [
  {
    title: 'Manyetik Separasyon Teknolojilerinde Öncü',
    subtitle: 'Cevher zenginleştirme ve metal ayırma çözümlerinde 25+ yıllık deneyim',
    buttonText: 'Ürünlerimizi Keşfedin',
    buttonLink: '/tr/urunler',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2024/11/slider-1-scaled.jpg',
  },
  {
    title: 'Endüstriyel Çözümler',
    subtitle: 'Madencilik, geri dönüşüm ve endüstriyel tesisler için özelleştirilmiş ekipmanlar',
    buttonText: 'Tesis ve Uygulamalar',
    buttonLink: '/tr/projeler',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2024/11/slider-2-scaled.jpg',
  },
  {
    title: 'NIRVIS Optik Separatörler',
    subtitle: '%100 yerli üretim, yapay zeka destekli optik ayırma teknolojisi',
    buttonText: 'Detaylı Bilgi',
    buttonLink: '/tr/urunler/nirvis-nir-optik-separator',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2024/11/slider-3-scaled.jpg',
  },
]

// Temp directory for downloads
const TEMP_DIR = path.join(__dirname, '../../temp-slider')
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true })
}

// Get auth token
async function getAuthToken(): Promise<string> {
  const response = await fetch(`${PAYLOAD_API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@bas.com.tr',
      password: 'BAS2026Admin!',
    }),
  })

  const data = (await response.json()) as { token: string }
  return data.token
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

// Get MIME type
function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  return mimeTypes[ext || ''] || 'image/jpeg'
}

// Upload media to Payload
async function uploadMedia(
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
    const checkData = (await checkResponse.json()) as { docs: Array<{ id: number }> }

    if (checkData.docs?.length > 0) {
      console.log(`  Already exists: ${filename} -> ${checkData.docs[0].id}`)
      return checkData.docs[0].id
    }

    // Read file and create blob
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer], { type: getMimeType(filename) })

    // Upload
    const formData = new globalThis.FormData()
    formData.append('file', blob, filename)
    formData.append('_payload', JSON.stringify({ alt: altText }))

    const response = await fetch(`${PAYLOAD_API_URL}/media`, {
      method: 'POST',
      headers: { Authorization: `JWT ${token}` },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`  Upload failed: ${error}`)
      return null
    }

    const data = (await response.json()) as { doc: { id: number } }
    console.log(`  Uploaded: ${filename} -> ${data.doc.id}`)
    return data.doc.id
  } catch (error) {
    console.error(`  Error uploading ${filename}:`, error)
    return null
  }
}

// Main function
async function syncSlider() {
  console.log('============================================================')
  console.log('Slider Sync to Production')
  console.log('============================================================')

  // Get auth token
  console.log('\n🔐 Getting auth token...')
  const token = await getAuthToken()
  console.log('✓ Token obtained')

  // Process slider images
  console.log('\n🖼️  Uploading slider images...')
  const heroSlides: Array<{
    heading?: string
    subheading?: string
    buttonLabel?: string
    buttonLink?: string
    backgroundImage?: number
  }> = []

  for (const slide of SLIDER_DATA) {
    console.log(`\n  Processing: ${slide.title}`)

    // Download image
    const filename = getFilenameFromUrl(slide.imageUrl)
    const tempPath = path.join(TEMP_DIR, filename)

    console.log(`    Downloading: ${filename}`)
    const downloaded = await downloadFile(slide.imageUrl, tempPath)
    console.log(`    Downloaded: ${downloaded}, file exists: ${fs.existsSync(tempPath)}`)

    let imageId: number | null = null
    if (downloaded && fs.existsSync(tempPath)) {
      const fileSize = fs.statSync(tempPath).size
      console.log(`    File size: ${fileSize} bytes`)
      imageId = await uploadMedia(token, tempPath, filename, slide.title)
      console.log(`    Image ID: ${imageId}`)
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
    } else {
      console.log(`    Download failed or file not found`)
    }

    heroSlides.push({
      heading: slide.title,
      subheading: slide.subtitle,
      buttonLabel: slide.buttonText,
      buttonLink: slide.buttonLink,
      backgroundImage: imageId || undefined,
    })
  }

  // Update Homepage global
  console.log('\n📝 Updating Homepage slider...')
  const updateResponse = await fetch(`${PAYLOAD_API_URL}/globals/homepage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({
      heroType: 'slider',
      heroSlides: heroSlides,
    }),
  })

  if (!updateResponse.ok) {
    const error = await updateResponse.text()
    console.error('Failed to update Homepage:', error)
  } else {
    console.log('✓ Homepage slider updated!')
  }

  // Cleanup
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true })
  }

  console.log('\n============================================================')
  console.log('Slider Sync Complete!')
  console.log('============================================================')
}

syncSlider().catch(console.error)
