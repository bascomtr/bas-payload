/**
 * WordPress Menu & Slider Migration Script
 * bas.com.tr -> Payload CMS
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import https from 'https'
import { execSync } from 'child_process'

// WordPress API Configuration
const WP_API_URL = 'https://bas.com.tr/wp-json'
const WP_USERNAME = process.env.WP_USERNAME || 'bastr'
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'JfqV 53po HT9A Lr4z esiZ Ikc8'
const AUTH_HEADER = `Basic ${Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')}`

const R2_BUCKET_NAME = 'bas-payload'
const TEMP_DIR = path.join(process.cwd(), 'temp-media')

interface WPMenuItem {
  id: number
  title: { rendered: string }
  url: string
  parent: number
  menu_order: number
  menus: number
}

interface WPMenu {
  id: number
  name: string
  slug: string
}

// Fetch from WordPress API
async function wpFetch<T>(endpoint: string): Promise<T> {
  const url = `${WP_API_URL}${endpoint}`
  console.log(`Fetching: ${url}`)

  const response = await fetch(url, {
    headers: {
      Authorization: AUTH_HEADER,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Convert WP URL to internal path
function urlToPath(url: string): string {
  if (!url) return '/'
  try {
    const parsed = new URL(url, 'https://bas.com.tr')
    return parsed.pathname || '/'
  } catch {
    return url.startsWith('/') ? url : `/${url}`
  }
}

// Build hierarchical menu structure
function buildMenuTree(items: WPMenuItem[]): Array<{
  label: string
  type: 'external'
  externalLink: string
  openInNewTab: boolean
  children: Array<{
    label: string
    type: 'external'
    externalLink: string
    openInNewTab: boolean
  }>
}> {
  // Sort by menu_order
  const sorted = [...items].sort((a, b) => a.menu_order - b.menu_order)

  // Get top-level items (parent = 0)
  const topLevel = sorted.filter((item) => item.parent === 0)

  return topLevel.map((item) => {
    const children = sorted
      .filter((child) => child.parent === item.id)
      .map((child) => ({
        label: child.title.rendered,
        type: 'external' as const,
        externalLink: urlToPath(child.url),
        openInNewTab: false,
      }))

    return {
      label: item.title.rendered,
      type: 'external' as const,
      externalLink: urlToPath(item.url),
      openInNewTab: item.url.includes('youtube.com'),
      children,
    }
  })
}

// Slider data extracted from WordPress homepage with images
const SLIDER_DATA = [
  {
    heading: 'Cevher Zenginleştirme Tesisleri',
    subheading: 'Madencilik sektörüne yönelik entegre çözümler',
    buttonLabel: 'Detaylı Bilgi',
    buttonLink: '/urun-kategori/cevher-zenginlestirme-tesisleri/',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/bas_solution_banner_0002_maden-1.jpg',
  },
  {
    heading: 'Ferrous Metal Seperatörler',
    subheading: 'Demir ve çelik ayırma teknolojileri',
    buttonLabel: 'İncele',
    buttonLink: '/urun-kategori/metal-seperatorler/',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/bas_solution_banner_0004_ferrous-1.jpg',
  },
  {
    heading: 'Optik Separatörler',
    subheading: 'Yüksek hassasiyetli optik ayırma sistemleri',
    buttonLabel: 'Keşfet',
    buttonLink: '/urun-kategori/optik-separatorler/',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2025/08/bas_solution_banner.jpg',
  },
  {
    heading: 'Eddy Current Non-Ferrous Metal Seperatörler',
    subheading: 'Demir dışı metal ayırma çözümleri',
    buttonLabel: 'Detaylı Bilgi',
    buttonLink: '/urun-kategori/metal-seperatorler/',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/bas_solution_banner_0001_non-ferrous-1.jpg',
  },
  {
    heading: 'Manyetik Zenginleştirme Ekipmanları',
    subheading: 'Endüstriyel manyetik separasyon sistemleri',
    buttonLabel: 'İncele',
    buttonLink: '/urun-kategori/cevher-zenginlestirme-ekipmanlari/',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/bas_solution_banner_0006_cevher-zeninlestirme-1.jpg',
  },
  {
    heading: 'Cüruf Zenginleştirme Tesisleri',
    subheading: 'Metal geri kazanım tesisleri',
    buttonLabel: 'Keşfet',
    buttonLink: '/urun-kategori/curuf-zenginlestirme-tesisleri/',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/bas_solution_banner_0005_curuf-banner-1.jpg',
  },
  {
    heading: 'Hurda Ayrıştırma Tesisleri',
    subheading: 'Geri dönüşüm ve hurda işleme sistemleri',
    buttonLabel: 'Detaylı Bilgi',
    buttonLink: '/urun-kategori/hurda-ayristirma-tesisleri/',
    imageUrl: 'https://bas.com.tr/wp-content/uploads/2025/01/bas_solution_banner_0003_hurda-1.jpg',
  },
]

// Download file from URL
function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath)
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location
        if (redirectUrl) {
          file.close()
          fs.unlinkSync(destPath)
          downloadFile(redirectUrl, destPath).then(resolve)
          return
        }
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve(true)
      })
    }).on('error', () => {
      fs.unlink(destPath, () => {})
      resolve(false)
    })
  })
}

// Get filename from URL
function getFilenameFromUrl(url: string): string {
  const parsed = new URL(url)
  return path.basename(parsed.pathname)
}

// Upload to R2 via wrangler
async function uploadToR2(imageUrl: string): Promise<string | null> {
  const filename = getFilenameFromUrl(imageUrl)
  const tempPath = path.join(TEMP_DIR, filename)
  const r2Key = `media/${filename}`

  // Check if already in R2
  try {
    execSync(`npx wrangler r2 object get ${R2_BUCKET_NAME}/${r2Key} --file=/dev/null --remote 2>/dev/null`, {
      cwd: process.cwd(),
      stdio: 'pipe',
    })
    console.log(`  Already in R2: ${filename}`)
    return r2Key
  } catch {
    // Not in R2, continue to upload
  }

  // Download
  console.log(`  Downloading: ${filename}`)
  const success = await downloadFile(imageUrl, tempPath)
  if (!success) {
    console.log(`  Download failed: ${filename}`)
    return null
  }

  // Upload to R2
  try {
    execSync(`npx wrangler r2 object put ${R2_BUCKET_NAME}/${r2Key} --file="${tempPath}" --remote`, {
      cwd: process.cwd(),
      stdio: 'pipe',
    })
    console.log(`  Uploaded to R2: ${r2Key}`)
    fs.unlinkSync(tempPath)
    return r2Key
  } catch (error) {
    console.error(`  R2 upload failed: ${filename}`)
    fs.unlinkSync(tempPath)
    return null
  }
}

async function migrateMenusAndSlider() {
  console.log('='.repeat(60))
  console.log('WordPress Menu & Slider Migration')
  console.log('='.repeat(60))

  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }

  const payload = await getPayload({ config })

  // 1. Fetch Turkish main menu
  console.log('\n📋 Fetching Turkish Main Menu (ID: 56)...')
  const menuItems = await wpFetch<WPMenuItem[]>('/wp/v2/menu-items?menus=56&per_page=50')
  console.log(`Found ${menuItems.length} menu items`)

  // Build menu tree
  const mainMenu = buildMenuTree(menuItems)
  console.log(`Built menu tree with ${mainMenu.length} top-level items`)

  // 2. Update Navigation global
  console.log('\n📋 Updating Navigation global...')
  try {
    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        mainMenu: mainMenu,
        showTopBar: true,
        topBarContent: 'BAS Manyetik | Endüstriyel Manyetik Çözümler',
      },
    })
    console.log('✓ Navigation updated successfully')
  } catch (error) {
    console.error('Failed to update Navigation:', error)
  }

  // 3. Upload slider images to R2 (without Payload records - local D1 issues)
  console.log('\n🖼️  Uploading slider images to R2...')
  let uploadedCount = 0
  
  for (const slide of SLIDER_DATA) {
    const r2Key = await uploadToR2(slide.imageUrl)
    if (r2Key) uploadedCount++
  }
  console.log(`✓ Uploaded ${uploadedCount} images to R2`)

  // Prepare slider data without image references (can be added manually in admin)
  const sliderWithImages = SLIDER_DATA.map(slide => ({
    heading: slide.heading,
    subheading: slide.subheading,
    buttonLabel: slide.buttonLabel,
    buttonLink: slide.buttonLink,
  }))

  // 4. Update Homepage global with slider
  console.log('\n🎠 Updating Homepage slider...')
  try {
    await payload.updateGlobal({
      slug: 'homepage',
      data: {
        heroType: 'slider',
        heroSlides: sliderWithImages,
        showFeaturedProducts: true,
        featuredProductsTitle: 'Ekipmanlarımız',
        featuredProductsLimit: 6,
        showFeaturedProjects: true,
        featuredProjectsTitle: 'Tesis ve Uygulamalar',
        featuredProjectsLimit: 3,
        showLatestNews: true,
        latestNewsTitle: 'Son Haberler',
        latestNewsLimit: 4,
        metaTitle: 'BAS Manyetik | Endüstriyel Manyetik Separasyon Sistemleri',
        metaDescription:
          'BAS Manyetik, cevher zenginleştirme, metal seperasyon ve geri dönüşüm tesisleri için endüstriyel manyetik çözümler sunar.',
      },
    })
    console.log('✓ Homepage updated successfully')
  } catch (error) {
    console.error('Failed to update Homepage:', error)
  }

  // Cleanup
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true })
  }

  console.log('\n' + '='.repeat(60))
  console.log('Migration Complete!')
  console.log('='.repeat(60))
  console.log(`Main Menu Items: ${mainMenu.length}`)
  console.log(`Slider Slides: ${sliderWithImages.length}`)
  console.log(`Images in R2: ${uploadedCount}`)
  console.log('\n📝 Note: Slider images uploaded to R2 but not linked in Payload.')
  console.log('   You can add them manually in Admin Panel -> Homepage -> Hero Slides')
}

migrateMenusAndSlider()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
