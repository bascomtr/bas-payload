import * as fs from 'fs'
import * as path from 'path'

/**
 * WordPress SQL Dump Parser
 *
 * Bu script, WordPress SQL dump dosyasını parse eder ve
 * Payload CMS'e aktarılabilir JSON formatına dönüştürür.
 *
 * Kullanım: npx tsx src/seed/parse-wordpress-sql.ts
 */

interface WPPost {
  ID: number
  post_author: number
  post_date: string
  post_content: string
  post_title: string
  post_excerpt: string
  post_status: string
  post_name: string // slug
  post_parent: number
  post_type: string
  menu_order: number
}

interface WPYoastIndexable {
  object_id: number
  permalink: string
  title: string
  description: string | null
  primary_focus_keyword: string | null
}

interface ParsedCategory {
  wpId: number
  slug: string
  title: string
  description?: string
}

interface ParsedProduct {
  wpId: number
  categoryWpId: number
  slug: string
  title: string
  content: string
  shortDescription?: string
  keywords?: string
  order: number
  images: string[]
  pdfCatalog?: string
}

const sqlFilePath = path.resolve(process.cwd(), 'u9222084_bas.sql')

// Equipment parent page ID (ekipmanlar)
const EQUIPMENT_PARENT_ID = 45

// Language suffixes to detect
const LANGUAGE_PATTERNS = {
  tr: /\/tr\//,
  en: /\/en\//,
  es: /\/es\//,
}

function parseSQLFile() {
  console.log('📖 SQL dosyası okunuyor...')
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8')

  console.log('🔍 wp_posts tablosu parse ediliyor...')
  const posts = parseWPPosts(sqlContent)
  console.log(`   - ${posts.length} post bulundu`)

  console.log('🔍 wp_yoast_indexable tablosu parse ediliyor...')
  const yoastData = parseYoastIndexable(sqlContent)
  console.log(`   - ${yoastData.length} SEO kaydı bulundu`)

  // Filter only published pages
  const publishedPages = posts.filter(
    (p) => p.post_type === 'page' && p.post_status === 'publish'
  )
  console.log(`   - ${publishedPages.length} yayınlanmış sayfa`)

  // Find equipment categories (direct children of equipment page)
  const categoryPages = publishedPages.filter((p) => p.post_parent === EQUIPMENT_PARENT_ID)
  console.log(`\n📁 Ekipman Kategorileri (${categoryPages.length} adet):`)

  const categories: ParsedCategory[] = []
  const categoryIds: number[] = []

  for (const cat of categoryPages) {
    const yoast = yoastData.find((y) => y.object_id === cat.ID)
    categories.push({
      wpId: cat.ID,
      slug: cat.post_name,
      title: cat.post_title,
      description: yoast?.description || undefined,
    })
    categoryIds.push(cat.ID)
    console.log(`   - [${cat.ID}] ${cat.post_title} (${cat.post_name})`)
  }

  // Find products (children of category pages)
  const productPages = publishedPages.filter((p) => categoryIds.includes(p.post_parent))
  console.log(`\n📦 Ürünler (${productPages.length} adet):`)

  const products: ParsedProduct[] = []

  for (const prod of productPages) {
    const yoast = yoastData.find((y) => y.object_id === prod.ID)
    const images = extractImagesFromContent(prod.post_content)
    const pdfCatalog = extractPDFFromContent(prod.post_content)

    products.push({
      wpId: prod.ID,
      categoryWpId: prod.post_parent,
      slug: prod.post_name,
      title: prod.post_title,
      content: prod.post_content,
      shortDescription: prod.post_excerpt || undefined,
      keywords: yoast?.primary_focus_keyword || undefined,
      order: prod.menu_order,
      images,
      pdfCatalog,
    })

    const categoryName = categories.find((c) => c.wpId === prod.post_parent)?.title || 'Bilinmeyen'
    console.log(`   - [${prod.ID}] ${prod.post_title} -> ${categoryName}`)
  }

  // Save parsed data to JSON
  const outputPath = path.resolve(process.cwd(), 'src/seed/wordpress-data.json')
  const data = {
    categories,
    products,
    metadata: {
      parsedAt: new Date().toISOString(),
      totalCategories: categories.length,
      totalProducts: products.length,
    },
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  console.log(`\n✅ Veriler kaydedildi: ${outputPath}`)

  // Print summary
  console.log('\n📊 Özet:')
  console.log(`   Kategoriler: ${categories.length}`)
  console.log(`   Ürünler: ${products.length}`)
  console.log('\n   Kategori başına ürün sayısı:')
  for (const cat of categories) {
    const count = products.filter((p) => p.categoryWpId === cat.wpId).length
    console.log(`   - ${cat.title}: ${count} ürün`)
  }
}

function parseWPPosts(sql: string): WPPost[] {
  const posts: WPPost[] = []

  // Find INSERT statements for wp_posts
  const insertPattern = /INSERT INTO `wp_posts`[^;]+;/gs
  const matches = sql.match(insertPattern)

  if (!matches) return posts

  for (const insert of matches) {
    // Extract VALUES part
    const valuesMatch = insert.match(/VALUES\s*(.+)/s)
    if (!valuesMatch) continue

    // Parse each row
    const rowPattern = /\((\d+),\s*(\d+),\s*'([^']*)',\s*'([^']*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']*)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*(\d+),\s*'[^']*',\s*(\d+),\s*'([^']*)',\s*'[^']*',\s*(\d+)\)/g

    let match
    // Simple regex to extract key fields
    const simplePattern = /\((\d+),\s*(\d+),\s*'[^']*',\s*'[^']*',\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*'(?:[^'\\]|\\.|'')*',\s*'([^']*)',/g

    while ((match = simplePattern.exec(insert)) !== null) {
      try {
        // This is a simplified parser - for production use a proper SQL parser
        const id = parseInt(match[1])
        const author = parseInt(match[2])
        const content = unescapeSQLString(match[3])
        const title = unescapeSQLString(match[4])
        const status = match[5]

        // Find post_name, post_parent, post_type later in the row
        // This requires more complex parsing
      } catch (e) {
        // Skip malformed rows
      }
    }
  }

  return posts
}

function parseYoastIndexable(sql: string): WPYoastIndexable[] {
  const data: WPYoastIndexable[] = []

  // Look for patterns in the yoast_indexable inserts
  // Format: (id, permalink, object_hash, object_id, object_type, object_sub_type, ...)
  const pattern = /\((\d+),\s*'([^']+)',\s*'[^']+',\s*(\d+),\s*'post',\s*'page',\s*\d+,\s*\d*,\s*(?:NULL|'[^']*'),\s*(?:NULL|'([^']*)'),\s*'([^']*)'/g

  let match
  while ((match = pattern.exec(sql)) !== null) {
    data.push({
      object_id: parseInt(match[3]),
      permalink: match[2],
      title: unescapeSQLString(match[5]),
      description: match[4] ? unescapeSQLString(match[4]) : null,
      primary_focus_keyword: null,
    })
  }

  return data
}

function extractImagesFromContent(content: string): string[] {
  const images: string[] = []
  const imgPattern = /src=["'](https?:\/\/[^"']*(?:\.jpg|\.jpeg|\.png|\.gif|\.webp)[^"']*)["']/gi

  let match
  while ((match = imgPattern.exec(content)) !== null) {
    // Convert WordPress URL to relative path
    const url = match[1]
    if (url.includes('wp-content/uploads')) {
      images.push(url)
    }
  }

  return [...new Set(images)] // Remove duplicates
}

function extractPDFFromContent(content: string): string | undefined {
  const pdfPattern = /href=["'](https?:\/\/[^"']*\.pdf[^"']*)["']/i
  const match = pdfPattern.exec(content)
  return match ? match[1] : undefined
}

function unescapeSQLString(str: string): string {
  return str
    .replace(/''/g, "'")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
}

// HTML'den text çıkar
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

// Run parser
parseSQLFile()
