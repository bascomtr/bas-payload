/**
 * WordPress REST API Migration Script
 * bas.com.tr -> Payload CMS
 *
 * Bu script WordPress REST API kullanarak:
 * - WooCommerce ürün kategorilerini
 * - WooCommerce ürünlerini
 * - Medya dosyalarını
 * Payload CMS'e aktarır.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import { execSync } from 'child_process'

// R2 Configuration
const R2_BUCKET_NAME = 'bas-payload'

// WordPress API Configuration
const WP_API_URL = 'https://bas.com.tr/wp-json'
const WP_USERNAME = process.env.WP_USERNAME || 'bastr'
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'JfqV 53po HT9A Lr4z esiZ Ikc8'

// Skip media upload in local development (Miniflare R2 issue)
const SKIP_MEDIA = process.env.SKIP_MEDIA === 'true'

// Force re-upload all media (ignore existing records)
const FORCE_MEDIA = process.env.FORCE_MEDIA === 'true'

// Base64 encode for Basic Auth
const AUTH_HEADER = `Basic ${Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64')}`

// Türkçe kategoriler (sadece TR kategorilerini çekiyoruz)
const TR_CATEGORY_SLUGS = [
  'cevher-zenginlestirme-ekipmanlari',
  'metal-seperatorler',
  'optik-separatorler',
  'elektromanyetik-kaldiraclar',
  'tasima-ve-saklama-ekipmanlari',
  'metal-dedektorleri-ve-bant-kantarlari',
  'elektrostatik-seperatorler',
  'demanyetizerler',
  'vibro-besleyiciler',
  // Tesisler
  'cevher-zenginlestirme-tesisleri',
  'curuf-zenginlestirme-tesisleri',
  'hurda-ayristirma-tesisleri',
]

// Temp directory for downloads
const TEMP_DIR = path.join(process.cwd(), 'temp-media')

interface WPCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  count: number
  image?: { src: string } | null
}

interface WPProduct {
  id: number
  name: string
  slug: string
  permalink: string
  description: string
  short_description: string
  categories: Array<{ id: number; name: string; slug: string }>
  images: Array<{ id: number; src: string; alt: string }>
  meta_data: Array<{ key: string; value: string }>
}

interface WPMedia {
  id: number
  source_url: string
  alt_text: string
  title: { rendered: string }
  media_details: {
    width: number
    height: number
    file: string
  }
}

// Fetch helper with auth
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
    const text = await response.text()
    throw new Error(`API Error ${response.status}: ${text}`)
  }

  return response.json()
}

// Fetch all pages of a paginated endpoint
async function wpFetchAll<T>(endpoint: string, perPage = 100): Promise<T[]> {
  const allItems: T[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const separator = endpoint.includes('?') ? '&' : '?'
    const items = await wpFetch<T[]>(`${endpoint}${separator}per_page=${perPage}&page=${page}`)

    if (items.length === 0) {
      hasMore = false
    } else {
      allItems.push(...items)
      page++
      if (items.length < perPage) {
        hasMore = false
      }
    }
  }

  return allItems
}

// Download file from URL
async function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath)
    const protocol = url.startsWith('https') ? https : http

    protocol
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            file.close()
            fs.unlinkSync(destPath)
            downloadFile(redirectUrl, destPath).then(resolve)
            return
          }
        }

        if (response.statusCode !== 200) {
          console.error(`Failed to download ${url}: ${response.statusCode}`)
          file.close()
          fs.unlinkSync(destPath)
          resolve(false)
          return
        }

        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(true)
        })
      })
      .on('error', (err) => {
        console.error(`Download error: ${err.message}`)
        file.close()
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath)
        resolve(false)
      })
  })
}

// Get filename from URL
function getFilenameFromUrl(url: string): string {
  const urlObj = new URL(url)
  const pathname = decodeURIComponent(urlObj.pathname)
  return path.basename(pathname)
}

// HTML to Lexical richText conversion
function htmlToLexical(html: string): object {
  if (!html || html.trim() === '') {
    return {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: '' }],
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    }
  }

  // Clean HTML
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
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }))

  if (paragraphs.length === 0) {
    paragraphs.push({
      type: 'paragraph',
      children: [{ type: 'text', text: '' }],
      direction: 'ltr',
      format: '',
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

// Strip HTML tags
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

// Main migration function
async function migrateFromWordPressAPI() {
  console.log('='.repeat(60))
  console.log('WordPress REST API Migration')
  console.log('='.repeat(60))

  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }

  const payload = await getPayload({ config })

  // Track uploaded media to avoid duplicates
  const mediaCache = new Map<string, string>() // URL -> Payload ID
  
  // Track categories by slug for better matching
  const categorySlugMap = new Map<string, string>() // WP Slug -> Payload ID

  // Upload media to R2 via S3 API
  async function uploadMedia(imageUrl: string, altText?: string): Promise<string | null> {
    // Skip media upload if SKIP_MEDIA is set
    if (SKIP_MEDIA) {
      console.log(`  [SKIP] Media upload disabled: ${getFilenameFromUrl(imageUrl)}`)
      return null
    }

    if (mediaCache.has(imageUrl)) {
      return mediaCache.get(imageUrl)!
    }

    try {
      const filename = getFilenameFromUrl(imageUrl)
      const tempPath = path.join(TEMP_DIR, filename)
      const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

      // Check if already exists in Payload by filename
      const existing = await payload.find({
        collection: 'media',
        where: { filename: { equals: filename } },
        limit: 1,
      })

      if (existing.docs.length > 0 && !FORCE_MEDIA) {
        const id = String(existing.docs[0].id)
        mediaCache.set(imageUrl, id)
        console.log(`  Media already exists: ${filename} -> ${id}`)
        return id
      }

      // If FORCE_MEDIA is set, delete existing record first
      if (existing.docs.length > 0 && FORCE_MEDIA) {
        console.log(`  Deleting existing media for re-upload: ${filename}`)
        await payload.delete({
          collection: 'media',
          id: existing.docs[0].id,
        })
      }

      // Download file
      console.log(`  Downloading: ${filename}`)
      const success = await downloadFile(imageUrl, tempPath)
      if (!success) {
        console.log(`  Download failed, skipping media: ${filename}`)
        return null
      }

      // Get file info
      const fileData = fs.readFileSync(tempPath)
      const fileSize = fs.statSync(tempPath).size
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpeg'
      const mimetypeMap: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
      }
      const mimetype = mimetypeMap[ext] || 'image/jpeg'

      // Upload to R2 via wrangler CLI
      const r2Key = `media/${filename}`
      
      try {
        execSync(`npx wrangler r2 object put ${R2_BUCKET_NAME}/${r2Key} --file="${tempPath}" --remote`, {
          cwd: process.cwd(),
          stdio: 'pipe',
        })
        console.log(`  Uploaded to R2: ${r2Key}`)
      } catch (r2Error) {
        console.error(`  R2 upload failed: ${filename}`)
        fs.unlinkSync(tempPath)
        return null
      }

      fs.unlinkSync(tempPath)
      
      // Store in cache with a placeholder - actual Payload records will be created in production
      mediaCache.set(imageUrl, `r2:${r2Key}`)
      return null // Return null since we don't have a Payload ID yet
    } catch (error) {
      console.error(`  Failed to upload media: ${imageUrl}`, error)
      return null
    }
  }

  // 1. Fetch categories from WooCommerce
  console.log('\n📁 Fetching WooCommerce Categories...')
  const allCategories = await wpFetchAll<WPCategory>('/wc/v3/products/categories')

  // Filter only Turkish categories
  const trCategories = allCategories.filter(
    (cat) => TR_CATEGORY_SLUGS.includes(cat.slug) || cat.count > 0,
  )

  console.log(`Found ${trCategories.length} categories to migrate`)

  // 2. Migrate categories
  console.log('\n📁 Migrating Categories to Payload...')
  const categoryMap = new Map<number, string>() // WP ID -> Payload ID

  for (const wpCat of trCategories) {
    // Skip non-Turkish categories (by checking name patterns)
    if (
      /^[А-Яа-я]/.test(wpCat.name) || // Russian
      wpCat.slug.includes('%') || // URL encoded (non-latin)
      wpCat.name.includes('ñ') // Spanish
    ) {
      continue
    }

    try {
      // Check if exists
      const existing = await payload.find({
        collection: 'product-categories',
        where: { slug: { equals: wpCat.slug } },
        limit: 1,
      })

      // Upload category image if exists
      let imageId: string | null = null
      if (wpCat.image?.src) {
        imageId = await uploadMedia(wpCat.image.src, wpCat.name)
      }

      if (existing.docs.length > 0) {
        // Update existing category with description if missing
        const existingCat = existing.docs[0] as { id: string | number; description?: unknown }
        const hasDescription = existingCat.description && 
          typeof existingCat.description === 'object' &&
          (existingCat.description as { root?: { children?: unknown[] } }).root?.children?.length > 0

        if (!hasDescription && wpCat.description) {
          await payload.update({
            collection: 'product-categories',
            id: existingCat.id,
            data: {
              description: htmlToLexical(wpCat.description),
              image: imageId || undefined,
            },
          })
          console.log(`  ✓ Updated category with description: ${wpCat.name}`)
        } else {
          console.log(`  ✓ Category exists: ${wpCat.name}`)
        }
        
        categoryMap.set(wpCat.id, String(existingCat.id))
        categorySlugMap.set(wpCat.slug, String(existingCat.id))
        continue
      }

      // Create category
      const newCat = await payload.create({
        collection: 'product-categories',
        data: {
          title: wpCat.name,
          slug: wpCat.slug,
          description: htmlToLexical(wpCat.description),
          image: imageId || undefined,
        },
      })

      categoryMap.set(wpCat.id, String(newCat.id))
      categorySlugMap.set(wpCat.slug, String(newCat.id))
      console.log(`  ✓ Created category: ${wpCat.name}`)
    } catch (error) {
      console.error(`  ✗ Failed to create category: ${wpCat.name}`, error)
    }
  }

  // 3. Fetch products from WooCommerce
  console.log('\n📦 Fetching WooCommerce Products...')
  const allProducts = await wpFetchAll<WPProduct>('/wc/v3/products')
  console.log(`Found ${allProducts.length} products`)

  // Filter Turkish products (those in Turkish categories)
  const trProducts = allProducts.filter((product) =>
    product.categories.some((cat) => TR_CATEGORY_SLUGS.includes(cat.slug)),
  )

  console.log(`Found ${trProducts.length} Turkish products to migrate`)

  // 4. Migrate products
  console.log('\n📦 Migrating Products to Payload...')

  for (const wpProduct of trProducts) {
    try {
      // Check if exists
      const existing = await payload.find({
        collection: 'products',
        where: { slug: { equals: wpProduct.slug } },
        limit: 1,
      })

      // Get category ID - try by ID first, then by slug
      const wpCat = wpProduct.categories[0]
      let payloadCatId: string | undefined
      
      if (wpCat) {
        // Try by WP ID first
        payloadCatId = categoryMap.get(wpCat.id)
        
        // If not found, try by slug
        if (!payloadCatId && wpCat.slug) {
          payloadCatId = categorySlugMap.get(wpCat.slug)
        }
        
        // If still not found, search in Payload by slug
        if (!payloadCatId && wpCat.slug) {
          const foundCat = await payload.find({
            collection: 'product-categories',
            where: { slug: { equals: wpCat.slug } },
            limit: 1,
          })
          if (foundCat.docs.length > 0) {
            payloadCatId = String(foundCat.docs[0].id)
            categorySlugMap.set(wpCat.slug, payloadCatId)
          }
        }
      }

      // Upload featured image
      let featuredImageId: string | null = null
      if (wpProduct.images.length > 0) {
        featuredImageId = await uploadMedia(wpProduct.images[0].src, wpProduct.images[0].alt)
      }

      // Upload gallery images
      const galleryIds: string[] = []
      for (let i = 1; i < wpProduct.images.length; i++) {
        const img = wpProduct.images[i]
        const imgId = await uploadMedia(img.src, img.alt)
        if (imgId) galleryIds.push(imgId)
      }

      if (existing.docs.length > 0) {
        // Update existing product with description if missing
        const existingProduct = existing.docs[0] as { 
          id: string | number
          description?: unknown
          shortDescription?: string
        }
        
        const hasDescription = existingProduct.description && 
          typeof existingProduct.description === 'object' &&
          (existingProduct.description as { root?: { children?: unknown[] } }).root?.children?.length > 0
        
        const hasShortDescription = existingProduct.shortDescription && 
          existingProduct.shortDescription.trim().length > 0

        if ((!hasDescription && wpProduct.description) || (!hasShortDescription && wpProduct.short_description)) {
          const updateData: Record<string, unknown> = {}
          
          if (stripHtml(wpProduct.short_description)) {
            updateData.shortDescription = stripHtml(wpProduct.short_description)
          }
          if (wpProduct.description) {
            updateData.description = htmlToLexical(wpProduct.description)
          }
          if (featuredImageId) {
            updateData.featuredImage = isNaN(Number(featuredImageId)) ? featuredImageId : Number(featuredImageId)
          }
          if (galleryIds.length > 0) {
            updateData.gallery = galleryIds.map((id) => ({ 
              image: isNaN(Number(id)) ? id : Number(id) 
            }))
          }
          if (payloadCatId) {
            updateData.category = isNaN(Number(payloadCatId)) ? payloadCatId : Number(payloadCatId)
          }
          
          await payload.update({
            collection: 'products',
            id: existingProduct.id,
            data: updateData,
          })
          console.log(`  ✓ Updated product with description: ${wpProduct.name}`)
        } else {
          console.log(`  ✓ Product exists: ${wpProduct.name}`)
        }
        continue
      }

      // Build product data - only include fields with valid values
      const productData: Record<string, unknown> = {
        title: wpProduct.name,
        slug: wpProduct.slug,
        status: 'published',
      }

      if (stripHtml(wpProduct.short_description)) {
        productData.shortDescription = stripHtml(wpProduct.short_description)
      }

      if (wpProduct.description) {
        productData.description = htmlToLexical(wpProduct.description)
      }

      if (featuredImageId) {
        // Convert to number if it's a numeric string
        productData.featuredImage = isNaN(Number(featuredImageId)) ? featuredImageId : Number(featuredImageId)
      }

      if (galleryIds.length > 0) {
        productData.gallery = galleryIds.map((id) => ({ 
          image: isNaN(Number(id)) ? id : Number(id) 
        }))
      }

      if (payloadCatId) {
        productData.category = isNaN(Number(payloadCatId)) ? payloadCatId : Number(payloadCatId)
      }

      // Create product
      const newProduct = await payload.create({
        collection: 'products',
        data: productData,
      })

      console.log(`  ✓ Created product: ${wpProduct.name}`)
    } catch (error) {
      console.error(`  ✗ Failed to create product: ${wpProduct.name}`, error)
    }
  }

  // Cleanup temp directory
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true })
  }

  console.log('\n' + '='.repeat(60))
  console.log('Migration Complete!')
  console.log('='.repeat(60))
  console.log(`Categories migrated: ${categoryMap.size}`)
  console.log(`Products migrated: ${trProducts.length}`)
  console.log(`Media uploaded: ${mediaCache.size}`)
}

// Run migration
migrateFromWordPressAPI()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nMigration failed:', error)
    process.exit(1)
  })
