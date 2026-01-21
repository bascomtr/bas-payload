import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'

/**
 * WordPress'ten Payload CMS'e Tam Migrasyon Scripti
 *
 * İçerir:
 * - Kategori ve ürün migrasyonu
 * - Medya dosyalarının indirilmesi ve yüklenmesi
 * - HTML içeriğin Lexical formatına dönüşümü
 * - SEO verilerinin aktarımı (wp_yoast_indexable)
 */

// WordPress base URL
const WP_BASE_URL = 'https://bas-tr.com'
const WP_UPLOADS_PATH = '/wp-content/uploads/'

// Temp directory for downloaded files
const TEMP_DIR = path.resolve(process.cwd(), '.temp-migration')

// Media ID mapping (WordPress attachment ID -> Payload media ID)
const mediaMapping: Record<string, string> = {}

// Category mapping (WordPress post ID -> Payload category ID)
const categoryMapping: Record<number, string> = {}

// ============================================================================
// WORDPRESS VERİLERİ
// ============================================================================

interface WPCategory {
  wpId: number
  slug: string
  title: { tr: string; en: string; es?: string }
  description?: { tr: string; en: string }
  image?: string // WordPress image URL
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

interface WPProduct {
  wpId: number
  categoryWpId: number
  slug: string
  title: { tr: string; en: string }
  shortDescription: { tr: string; en: string }
  description?: { tr: string; en: string } // HTML content
  keywords?: string
  order: number
  images: string[] // WordPress image URLs
  featuredImage?: string
  pdfCatalog?: string
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
  }
}

// Kategoriler - SQL'den çıkarılan veriler
const wpCategories: WPCategory[] = [
  {
    wpId: 88,
    slug: 'cevher-zenginlestirme-ekipmanlari',
    title: {
      tr: 'Cevher Zenginleştirme Ekipmanları',
      en: 'Ore Enrichment Equipment',
      es: 'Equipos de Enriquecimiento de Minerales',
    },
    description: {
      tr: 'Cevherinizin tenörünü yükseltelim, verimliliği artıralım! B A S olarak cevherinizin mineralojisine en uygun zenginleştirme metodunu belirliyor ve sayısız deneylerle optimum çözüme ulaşıyoruz.',
      en: "Let's increase the grade of your ore and efficiency! As B A S, we determine the most suitable enrichment method for your ore's mineralogy and reach the optimum solution with numerous experiments.",
    },
    image: 'https://bas-tr.com/wp-content/uploads/2020/03/anasayfa_ekipmanbuton_cevher-zenginlestirme.jpg',
  },
  {
    wpId: 92,
    slug: 'metal-dedektorleri',
    title: {
      tr: 'Metal Dedektörler',
      en: 'Metal Detectors',
      es: 'Detectores de Metal',
    },
    description: {
      tr: 'B.A.S. metal dedektörleri konveyörler üzerinde uygulama tipi olarak tek sensörlü ve tünel tipte olmaktadır.',
      en: 'B.A.S. metal detectors are available in single sensor and tunnel type for conveyor applications.',
    },
    seo: {
      keywords: 'metal dedektör; konveyör tipi metal dedektör; tek sensörlü metal dedektör; çift sensörlü metal dedektör; tünel tipi metal dedektör',
    },
  },
  {
    wpId: 94,
    slug: 'metal-seperatorler',
    title: {
      tr: 'Metal Seperatörler',
      en: 'Metal Separators',
      es: 'Separadores de Metal',
    },
    description: {
      tr: 'Ferrous ve non-ferrous metallerin yüksek verimle ayrıştırılması için manyetik ve elektromanyetik seperatör sistemleri.',
      en: 'Magnetic and electromagnetic separator systems for high efficiency separation of ferrous and non-ferrous metals.',
    },
    image: 'https://bas-tr.com/wp-content/uploads/2020/03/anasayfa_ekipmanbuton_metalseparator.jpg',
    seo: {
      keywords: 'metal separator metal separatör',
    },
  },
  {
    wpId: 100,
    slug: 'demanyetizorler',
    title: {
      tr: 'Demanyetizerler',
      en: 'Demagnetizers',
      es: 'Desmagnetizadores',
    },
    description: {
      tr: 'Manyetik işlemlerden sonra malzemelerin demanyetize edilmesi için kullanılan sistemler.',
      en: 'Systems used for demagnetizing materials after magnetic processes.',
    },
  },
  {
    wpId: 104,
    slug: 'elektromanyetik-kaldiraclar',
    title: {
      tr: 'Elektromanyetik Kaldıraçlar',
      en: 'Electromagnetic Lifters',
      es: 'Elevadores Electromagnéticos',
    },
    description: {
      tr: 'Hurda işleme ve taşıma uygulamaları için elektromanyetik kaldırma sistemleri.',
      en: 'Electromagnetic lifting systems for scrap handling and transport applications.',
    },
    seo: {
      keywords: 'hurda magnet; elektromagnet; elektromanyetik kaldıraç; elektro magnet; magnet; hurda',
    },
  },
  {
    wpId: 108,
    slug: 'tasima-ve-saklama-ekipmanlari',
    title: {
      tr: 'Taşıma ve Saklama Ekipmanları',
      en: 'Conveying and Storage Equipment',
      es: 'Equipos de Transporte y Almacenamiento',
    },
    description: {
      tr: 'Endüstriyel malzeme taşıma ve depolama için konveyör, bunker ve silo sistemleri.',
      en: 'Conveyor, bunker and silo systems for industrial material handling and storage.',
    },
  },
  {
    wpId: 112,
    slug: 'sarkacli-ve-elektromanyetik-besleyiciler',
    title: {
      tr: 'Sarkaçlı ve Elektromanyetik Besleyiciler',
      en: 'Pendulum and Electromagnetic Feeders',
      es: 'Alimentadores de Péndulo y Electromagnéticos',
    },
    description: {
      tr: 'Kontrollü malzeme besleme için vibrasyon ve sarkaçlı besleme sistemleri.',
      en: 'Vibration and pendulum feeding systems for controlled material feeding.',
    },
  },
]

// Ürünler - SQL'den çıkarılan veriler
const wpProducts: WPProduct[] = [
  // === Cevher Zenginleştirme Ekipmanları (88) ===
  {
    wpId: 934,
    categoryWpId: 88,
    slug: 'kuru-manyetik-tambur-seperatorler',
    title: {
      tr: 'Kuru Manyetik Tambur Seperatörler',
      en: 'Dry Magnetic Drum Separators',
    },
    shortDescription: {
      tr: 'Kuru manyetik tambur separatörler 0-40mm tane boyutunda manyetik alınganlığı olan cevherlerin diğer non-manyetik malzemelerden ayrıştırılmasında veya farklı manyetik alınganlığa sahip iki farklı metal malzemenin seperasyonunda kullanılmaktadır.',
      en: 'Dry magnetic drum separators are used for separation of ores with magnetic susceptibility in 0-40mm grain size from other non-magnetic materials or separation of two different metal materials with different magnetic susceptibility.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_kurumanyetiktamburseparator1.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_kurumanyetiktamburseparator2.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_kurumanyetiktamburseparator3.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_kurumanyetiktamburseparator4.jpg',
    ],
    seo: {
      keywords: 'tambur separator; manyetik tambur separator',
    },
    order: 1,
  },
  {
    wpId: 938,
    categoryWpId: 88,
    slug: 'yas-manyetik-tambur-seperatorler',
    title: {
      tr: 'Yaş Manyetik Tambur Seperatörler',
      en: 'Wet Magnetic Drum Separators',
    },
    shortDescription: {
      tr: 'Yaş manyetik tambur separatörler oksit ve hidroksitler başta olmak üzere düşük tenörlü cevherlerin zenginleştirilmesinde kullanılır. Mikronize boyutlu manyetik tambur separatörler ise seramik ve refrakter sektörlerinde slurry içerisindeki manyetik empüritelerin uzaklaştırılmasında tercih edilmektedir.',
      en: 'Wet magnetic drum separators are used for enrichment of low-grade ores, especially oxides and hydroxides. Micronized magnetic drum separators are preferred in ceramic and refractory sectors for removing magnetic impurities in slurry.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_yasmanyetiktamburseparator1.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_yasmanyetiktamburseparator2.jpg',
    ],
    seo: {
      keywords: 'yaş manyetik separator; mikronize manyetik tambur; yaş tambur; manyetik tambur',
    },
    order: 2,
  },
  {
    wpId: 942,
    categoryWpId: 88,
    slug: 'roll-manyetik-seperatorler',
    title: {
      tr: 'Roll Manyetik Seperatörler',
      en: 'Roll Magnetic Separators',
    },
    shortDescription: {
      tr: 'Roll manyetik separatörler yüksek manyetik alan şiddetine sahip olup zayıf manyetik alınganlıktaki cevherlerin zenginleştirilmesinde kullanılır.',
      en: 'Roll magnetic separators have high magnetic field intensity and are used for enrichment of ores with weak magnetic susceptibility.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_rollmanyetikseparator1.jpg',
    ],
    seo: {
      keywords: 'manyetik separator; roll manyetik separator; yüksek manyetik alan',
    },
    order: 3,
  },
  {
    wpId: 946,
    categoryWpId: 88,
    slug: 'yuksek-alan-siddetli-yas-elektromanyetik-filtre',
    title: {
      tr: 'Yüksek Alan Şiddetli Yaş Elektromanyetik Filtre',
      en: 'High Intensity Wet Electromagnetic Filter',
    },
    shortDescription: {
      tr: 'B.A.S. Yüksek alan şiddetli elektromanyetik filtreler non-manyetik malzemeler içerisinde istenmeyen manyetik empüritelerin ve safsızlığa sebep olan malzemelerin sepere edilmesinde tercih edilmektedir.',
      en: 'B.A.S. High intensity electromagnetic filters are preferred for separating unwanted magnetic impurities and materials causing impurity in non-magnetic materials.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/07/bas-tr.comekipmanlarcevher-zenginlestirme-ekipmanlariyuksek-alan-siddetli-yas-elektromanyetik-filtre-scaled.jpg',
    ],
    seo: {
      keywords: 'yüksek manyetik alan; manyetik separator; elektromanyetik separator',
    },
    order: 4,
  },
  {
    wpId: 953,
    categoryWpId: 88,
    slug: 'yuksek-alan-siddetli-yas-elektromanyetik-seperator',
    title: {
      tr: 'Yüksek Alan Şiddetli Yaş Elektromanyetik Seperatör',
      en: 'High Intensity Wet Electromagnetic Separator',
    },
    shortDescription: {
      tr: 'Yüksek alan şiddetli elektromanyetik separatörler zayıf manyetik minerallerin yaş ortamda yüksek verimle ayrıştırılması için kullanılır.',
      en: 'High intensity electromagnetic separators are used for high efficiency separation of weakly magnetic minerals in wet environment.',
    },
    images: [],
    seo: {
      keywords: 'yüksek alan şiddetli manyetik separator; manyetik separator; elektromanyetik separator',
    },
    order: 5,
  },
  {
    wpId: 958,
    categoryWpId: 88,
    slug: 'klasifikatorler',
    title: {
      tr: 'Klasifikatörler',
      en: 'Classifiers',
    },
    shortDescription: {
      tr: 'Spiral ve mekanik klasifikatörler cevher hazırlama ve sınıflandırma işlemlerinde kullanılır.',
      en: 'Spiral and mechanical classifiers are used in ore preparation and classification processes.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_cevherzenginlestirme_klasifikator1.jpg',
    ],
    order: 6,
  },
  // === Metal Seperatörler (94) ===
  {
    wpId: 961,
    categoryWpId: 94,
    slug: 'elektromanyetik-bant-ustu-metal-seperatorler',
    title: {
      tr: 'Elektromanyetik Bant Üstü Metal Seperatörler',
      en: 'Electromagnetic Overbelt Metal Separators',
    },
    shortDescription: {
      tr: 'Elektromanyetik bant üstü metal separatörler konveyör bantları üzerinde taşınan malzemeler içerisine karışmış ferrous metallerin yüksek verimle ayrıştırılmasında kullanılır.',
      en: 'Electromagnetic overbelt metal separators are used for high efficiency separation of ferrous metals mixed in materials transported on conveyor belts.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_metalseparasyon_elektromanyetikbantustumetalseparator1.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_metalseparasyon_elektromanyetikbantustumetalseparator2.jpg',
    ],
    seo: {
      keywords: 'elektromanyetik separator; elektromanyetik metal separator; bant üstü separator',
    },
    order: 1,
  },
  {
    wpId: 965,
    categoryWpId: 94,
    slug: 'dogal-permanent-manyetik-bant-ustu-metal-seperatorler',
    title: {
      tr: 'Doğal (Permanent) Manyetik Bant Üstü Metal Seperatörler',
      en: 'Permanent Magnetic Overbelt Metal Separators',
    },
    shortDescription: {
      tr: 'Doğal mıknatıs teknolojisi ile enerji tasarrufu sağlayan bant üstü metal seperatörler. Konveyör bantlarının üzerinde ferrous metal ayrıştırma için kullanılır.',
      en: 'Overbelt metal separators providing energy savings with permanent magnet technology. Used for ferrous metal separation on conveyor belts.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_metalseparasyon_permanentbantustumetalseparator1.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/07/bas-tr.comekipmanlarmetal-seperatorlerdogal-permanent-manyetik-bant-ustu-metal-seperatorler-2-scaled.jpg',
    ],
    seo: {
      keywords: 'metal tutucu; manyetik tutucu; bant üstü tutucu; bantlı separator; konveyor ustu metal separator',
    },
    order: 2,
  },
  {
    wpId: 968,
    categoryWpId: 94,
    slug: 'basit-tip-metal-seperatorler',
    title: {
      tr: 'Basit Tip Metal Seperatörler',
      en: 'Simple Type Metal Separators',
    },
    shortDescription: {
      tr: 'Çubuk mıknatıs, ızgara mıknatıs ve çekmeceli seperatör sistemleri. Gıda, plastik ve kimya endüstrisinde yaygın kullanılır.',
      en: 'Bar magnet, grate magnet and drawer separator systems. Widely used in food, plastic and chemical industries.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_metalseparasyon_cekmeceliseparator.jpg',
    ],
    seo: {
      keywords: 'bar separatör; çubuk mıknatıs;',
    },
    order: 3,
  },
  {
    wpId: 971,
    categoryWpId: 94,
    slug: 'eddy-current-non-ferrous-metal-seperatorler',
    title: {
      tr: 'Eddy Current Non-Ferrous Metal Seperatörler',
      en: 'Eddy Current Non-Ferrous Metal Separators',
    },
    shortDescription: {
      tr: 'Alüminyum, bakır ve diğer non-ferrous metallerin ayrıştırılması için eddy current teknolojisi. Geri dönüşüm sektöründe yaygın kullanılır.',
      en: 'Eddy current technology for separation of aluminum, copper and other non-ferrous metals. Widely used in recycling industry.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/07/bas-tr.comekipmanlarmetal-seperatorlereddy-current-non-ferrous-metal-seperatorler-1.jpg',
    ],
    seo: {
      keywords: 'eddy current separatör; non ferrous metal separatör; non-ferrous; eddy current',
    },
    order: 4,
  },
  // === Metal Dedektörler (92) ===
  {
    wpId: 1000,
    categoryWpId: 92,
    slug: 'konveyor-tipi-metal-dedektorler',
    title: {
      tr: 'Konveyör Tipi Metal Dedektörler',
      en: 'Conveyor Type Metal Detectors',
    },
    shortDescription: {
      tr: 'Konveyör bantlarında metal kontaminasyonu tespit eden yüksek hassasiyetli dedektör sistemleri.',
      en: 'High precision detector systems for detecting metal contamination on conveyor belts.',
    },
    images: [],
    order: 1,
  },
  {
    wpId: 1001,
    categoryWpId: 92,
    slug: 'tek-sensorlu-metal-dedektorler',
    title: {
      tr: 'Tek Sensörlü Metal Dedektörler',
      en: 'Single Sensor Metal Detectors',
    },
    shortDescription: {
      tr: 'Ekonomik çözüm sunan tek sensörlü metal dedektör sistemleri. Bantın alt kısmına takılır ve ferrous/non-ferrous metallerin tespitinde kullanılır.',
      en: 'Single sensor metal detector systems offering economical solutions. Mounted under the belt and used for detection of ferrous/non-ferrous metals.',
    },
    images: [],
    order: 2,
  },
  // === Demanyetizerler (100) ===
  {
    wpId: 1100,
    categoryWpId: 100,
    slug: 'konveyor-tipi-demanyetizorler',
    title: {
      tr: 'Konveyör Tipi Demanyetizerler',
      en: 'Conveyor Type Demagnetizers',
    },
    shortDescription: {
      tr: 'Konveyör bantları üzerinde geçen malzemelerin demanyetize edilmesi için tasarlanmış sistemler.',
      en: 'Systems designed for demagnetizing materials passing on conveyor belts.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_demanyetizor1.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_demanyetizor2.jpg',
    ],
    order: 1,
  },
  // === Elektromanyetik Kaldıraçlar (104) ===
  {
    wpId: 1104,
    categoryWpId: 104,
    slug: 'yuvarlak-elektromanyetik-kaldiraclar',
    title: {
      tr: 'Yuvarlak Elektromanyetik Kaldıraçlar',
      en: 'Circular Electromagnetic Lifters',
    },
    shortDescription: {
      tr: 'Hurda işleme ve taşıma uygulamaları için yuvarlak elektromanyetik kaldırma sistemleri.',
      en: 'Circular electromagnetic lifting systems for scrap handling and transport applications.',
    },
    images: [],
    order: 1,
  },
  {
    wpId: 1105,
    categoryWpId: 104,
    slug: 'dikdortgen-elektromanyetik-kaldiraclar',
    title: {
      tr: 'Dikdörtgen Elektromanyetik Kaldıraçlar',
      en: 'Rectangular Electromagnetic Lifters',
    },
    shortDescription: {
      tr: 'Sac ve profil taşıma için dikdörtgen elektromanyetik kaldırıcılar.',
      en: 'Rectangular electromagnetic lifters for sheet and profile handling.',
    },
    images: [],
    order: 2,
  },
  // === Taşıma ve Saklama Ekipmanları (108) ===
  {
    wpId: 976,
    categoryWpId: 108,
    slug: 'bantli-konveyorler',
    title: {
      tr: 'Bantlı Konveyörler',
      en: 'Belt Conveyors',
    },
    shortDescription: {
      tr: 'Endüstriyel malzeme taşıma için bantlı konveyör sistemleri. Madencilik, geri dönüşüm ve diğer sektörlerde kullanılır.',
      en: 'Belt conveyor systems for industrial material handling. Used in mining, recycling and other sectors.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_saklamatasima_bantlikonveyor1.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_saklamatasima_bantlikonveyor2.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_saklamatasima_bantlikonveyor3.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_saklamatasima_bantlikonveyor4.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_saklamatasima_bantlikonveyor5.jpg',
    ],
    order: 1,
  },
  {
    wpId: 1108,
    categoryWpId: 108,
    slug: 'bunkerler-ve-silolar',
    title: {
      tr: 'Bunkerler ve Silolar',
      en: 'Bunkers and Silos',
    },
    shortDescription: {
      tr: 'Malzeme depolama için bunker ve silo sistemleri.',
      en: 'Bunker and silo systems for material storage.',
    },
    images: [],
    order: 2,
  },
  // === Besleyiciler (112) ===
  {
    wpId: 1112,
    categoryWpId: 112,
    slug: 'elektromanyetik-besleyiciler',
    title: {
      tr: 'Elektromanyetik Besleyiciler',
      en: 'Electromagnetic Feeders',
    },
    shortDescription: {
      tr: 'Kontrollü malzeme besleme için elektromanyetik vibrasyon besleyiciler.',
      en: 'Electromagnetic vibration feeders for controlled material feeding.',
    },
    images: [
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_vibrobesleyici1.jpg',
      'https://bas-tr.com/wp-content/uploads/2020/03/ekipmanlar_vibrobesleyici2.jpg',
    ],
    order: 1,
  },
  {
    wpId: 1113,
    categoryWpId: 112,
    slug: 'sarkacli-besleyiciler',
    title: {
      tr: 'Sarkaçlı Besleyiciler',
      en: 'Pendulum Feeders',
    },
    shortDescription: {
      tr: 'Ağır tonajlı malzemeler için sarkaçlı besleme sistemleri.',
      en: 'Pendulum feeding systems for heavy tonnage materials.',
    },
    images: [],
    order: 2,
  },
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * URL'den dosya indir
 */
async function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http

    const file = fs.createWriteStream(destPath)

    protocol
      .get(url, (response) => {
        // Follow redirects
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
          file.close()
          fs.unlinkSync(destPath)
          console.log(`    ⚠️  İndirme başarısız (${response.statusCode}): ${url}`)
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
        file.close()
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath)
        }
        console.log(`    ⚠️  İndirme hatası: ${err.message}`)
        resolve(false)
      })
  })
}

/**
 * URL'den dosya adını çıkar
 */
function getFilenameFromUrl(url: string): string {
  const urlPath = new URL(url).pathname
  return path.basename(decodeURIComponent(urlPath))
}

/**
 * HTML içeriği Lexical formatına dönüştür
 */
function htmlToLexical(html: string): object {
  // Basit HTML -> Lexical dönüşümü
  // WordPress HTML'ini temizle
  const cleanHtml = html
    .replace(/<!-- wp:html -->/g, '')
    .replace(/<!-- \/wp:html -->/g, '')
    .replace(/<div[^>]*class="[^"]*grid[^"]*"[^>]*>/g, '')
    .replace(/<\/div>/g, '')
    .replace(/\n+/g, '\n')
    .trim()

  // Paragrafları çıkar
  const paragraphs: Array<{ type: string; children: Array<{ type: string; text: string }> }> = []

  // Basit metin çıkarma - gerçek implementasyonda bir HTML parser kullanılmalı
  const textContent = cleanHtml
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '$1\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

  // Her satırı paragraf yap
  const lines = textContent.split('\n').filter((line) => line.trim())

  for (const line of lines) {
    paragraphs.push({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: line.trim(),
        },
      ],
    })
  }

  if (paragraphs.length === 0) {
    paragraphs.push({
      type: 'paragraph',
      children: [{ type: 'text', text: '' }],
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
 * Short description'dan Lexical oluştur
 */
function textToLexical(text: string): object {
  const paragraphs = text.split('\n').filter((p) => p.trim())

  const children = paragraphs.map((p) => ({
    type: 'paragraph',
    children: [{ type: 'text', text: p.trim() }],
  }))

  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      children: [{ type: 'text', text: '' }],
    })
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

async function migrateMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  imageUrls: string[]
): Promise<string[]> {
  const mediaIds: string[] = []

  // Temp dizinini oluştur
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
  }

  for (const url of imageUrls) {
    // Zaten yüklenmişse atla
    const cacheKey = url
    if (mediaMapping[cacheKey]) {
      mediaIds.push(mediaMapping[cacheKey])
      continue
    }

    try {
      const filename = getFilenameFromUrl(url)
      const tempPath = path.join(TEMP_DIR, filename)

      // Dosyayı indir
      console.log(`    📥 İndiriliyor: ${filename}`)
      const downloaded = await downloadFile(url, tempPath)

      if (!downloaded) {
        continue
      }

      // Alt text oluştur
      const altText = filename
        .replace(/[-_]/g, ' ')
        .replace(/\.[^.]+$/, '')
        .replace(/\d+$/, '')
        .trim()

      // Payload'a yükle
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: altText || 'Product image',
        },
        filePath: tempPath,
      })

      mediaMapping[cacheKey] = media.id
      mediaIds.push(media.id)
      console.log(`    ✅ Yüklendi: ${filename}`)

      // Temp dosyasını sil
      fs.unlinkSync(tempPath)
    } catch (error) {
      console.log(`    ⚠️  Medya hatası: ${(error as Error).message}`)
    }
  }

  return mediaIds
}

async function migrateCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('\n📁 Kategoriler oluşturuluyor...')

  for (const cat of wpCategories) {
    const existing = await payload.find({
      collection: 'product-categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      categoryMapping[cat.wpId] = existing.docs[0].id
      console.log(`  ⏭️  ${cat.title.tr} (zaten mevcut)`)
      continue
    }

    // Kategori görselini yükle
    let imageId: string | undefined
    if (cat.image) {
      console.log(`  📷 Kategori görseli yükleniyor: ${cat.title.tr}`)
      const mediaIds = await migrateMedia(payload, [cat.image])
      imageId = mediaIds[0]
    }

    // Kategori oluştur - TR
    const created = await payload.create({
      collection: 'product-categories',
      data: {
        title: cat.title.tr,
        slug: cat.slug,
        description: cat.description?.tr ? textToLexical(cat.description.tr) : undefined,
        image: imageId,
        order: wpCategories.indexOf(cat),
      },
      locale: 'tr',
    })

    // EN
    await payload.update({
      collection: 'product-categories',
      id: created.id,
      data: {
        title: cat.title.en,
        description: cat.description?.en ? textToLexical(cat.description.en) : undefined,
      },
      locale: 'en',
    })

    // ES
    if (cat.title.es) {
      await payload.update({
        collection: 'product-categories',
        id: created.id,
        data: {
          title: cat.title.es,
        },
        locale: 'es',
      })
    }

    categoryMapping[cat.wpId] = created.id
    console.log(`  ✅ ${cat.title.tr}`)
  }
}

async function migrateProducts(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('\n📦 Ürünler oluşturuluyor...')

  for (const product of wpProducts) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      console.log(`  ⏭️  ${product.title.tr} (zaten mevcut)`)
      continue
    }

    const categoryId = categoryMapping[product.categoryWpId]

    if (!categoryId) {
      console.log(`  ⚠️  ${product.title.tr} - Kategori bulunamadı (wpId: ${product.categoryWpId})`)
      continue
    }

    // Ürün görsellerini yükle
    let featuredImageId: string | undefined
    let galleryItems: Array<{ image: string; caption?: string }> = []

    if (product.images.length > 0) {
      console.log(`  📷 Görseller yükleniyor: ${product.title.tr}`)
      const mediaIds = await migrateMedia(payload, product.images)

      if (mediaIds.length > 0) {
        featuredImageId = mediaIds[0]
        galleryItems = mediaIds.slice(1).map((id) => ({ image: id }))
      }
    }

    // Ürün oluştur - TR
    const created = await payload.create({
      collection: 'products',
      data: {
        title: product.title.tr,
        slug: product.slug,
        shortDescription: product.shortDescription.tr,
        description: product.description?.tr
          ? htmlToLexical(product.description.tr)
          : textToLexical(product.shortDescription.tr),
        category: categoryId,
        featuredImage: featuredImageId,
        gallery: galleryItems.length > 0 ? galleryItems : undefined,
        order: product.order,
        status: 'published',
        _status: 'published',
        // SEO
        meta: product.seo
          ? {
              title: product.seo.metaTitle || product.title.tr,
              description: product.seo.metaDescription || product.shortDescription.tr.slice(0, 160),
              keywords: product.seo.keywords,
            }
          : undefined,
      },
      locale: 'tr',
      draft: false,
    })

    // EN
    await payload.update({
      collection: 'products',
      id: created.id,
      data: {
        title: product.title.en,
        shortDescription: product.shortDescription.en,
        description: product.description?.en
          ? htmlToLexical(product.description.en)
          : textToLexical(product.shortDescription.en),
        meta: product.seo
          ? {
              title: product.seo.metaTitle || product.title.en,
              description: product.seo.metaDescription || product.shortDescription.en.slice(0, 160),
            }
          : undefined,
      },
      locale: 'en',
      draft: false,
    })

    console.log(`  ✅ ${product.title.tr}`)
  }
}

// ============================================================================
// WORDPRESS SAYFALARI
// ============================================================================

interface WPPage {
  wpId: number
  slug: string
  title: { tr: string; en: string }
  heroSubtitle?: { tr: string; en: string }
  heroType: 'none' | 'simple' | 'withImage' | 'fullWidth'
  heroImage?: string
  content: Array<{
    blockType: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>
  }>
  seo?: {
    metaTitle?: string
    metaDescription?: string
  }
}

const wpPages: WPPage[] = [
  {
    wpId: 45,
    slug: 'ekipmanlar',
    title: {
      tr: 'Ekipmanlar',
      en: 'Equipment',
    },
    heroType: 'fullWidth',
    heroSubtitle: {
      tr: 'Cevher zenginleştirme, seperasyon ve teknolojik iletim ekipmanları. Manyetik cevher zenginleştirme ekipmanları, susuzlandırma grubu, metal separasyon ve dedekte etme grubu, geniş aktarma grubu ve depolama ürün portföyü.',
      en: 'Ore enrichment, separation and technological transmission equipment. Magnetic ore enrichment equipment, dewatering group, metal separation and detection group, wide transfer group and storage product portfolio.',
    },
    heroImage: 'https://bas-tr.com/wp-content/uploads/2020/02/bg-00001.jpg',
    content: [
      {
        blockType: 'content',
        data: {
          columns: 'one',
          backgroundColor: 'white',
          contentItems: [
            {
              content: {
                tr: 'B A S olarak endüstriyel separasyon ve cevher zenginleştirme alanında geniş bir ürün yelpazesi sunuyoruz. Her bir ekipmanımız, yılların deneyimi ve mühendislik birikimi ile tasarlanmaktadır.',
                en: 'As B A S, we offer a wide range of products in industrial separation and ore enrichment. Each of our equipment is designed with years of experience and engineering expertise.',
              },
            },
          ],
        },
      },
      {
        blockType: 'productGrid',
        data: {
          heading: { tr: 'Ekipman Kategorilerimiz', en: 'Our Equipment Categories' },
          description: {
            tr: 'İhtiyacınıza uygun ekipmanı keşfedin',
            en: 'Discover the equipment that suits your needs',
          },
          source: 'featured',
          limit: 8,
          columns: '4',
          showCTA: true,
          ctaLink: '/urunler',
          ctaLabel: { tr: 'Tüm Ürünleri Gör', en: 'View All Products' },
        },
      },
    ],
    seo: {
      metaTitle: 'Ekipmanlar | BAS Endüstriyel',
      metaDescription:
        'Cevher zenginleştirme, metal separasyon, manyetik tambur ve endüstriyel taşıma ekipmanları.',
    },
  },
]

// Page mapping (WordPress post ID -> Payload page ID)
const pageMapping: Record<number, string> = {}

async function migratePages(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('\n📄 Sayfalar oluşturuluyor...')

  for (const page of wpPages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      pageMapping[page.wpId] = existing.docs[0].id
      console.log(`  ⏭️  ${page.title.tr} (zaten mevcut)`)
      continue
    }

    // Hero görselini yükle
    let heroImageId: string | undefined
    if (page.heroImage) {
      console.log(`  📷 Hero görseli yükleniyor: ${page.title.tr}`)
      const mediaIds = await migrateMedia(payload, [page.heroImage])
      heroImageId = mediaIds[0]
    }

    // Content blocks oluştur
    const contentBlocks = page.content.map((block) => {
      if (block.blockType === 'content') {
        return {
          blockType: 'content',
          columns: block.data.columns || 'one',
          backgroundColor: block.data.backgroundColor || 'white',
          paddingTop: 'medium',
          paddingBottom: 'medium',
          contentItems: block.data.contentItems.map(
            (item: { content: { tr: string; en?: string } }) => ({
              content: textToLexical(item.content.tr),
            })
          ),
        }
      }

      if (block.blockType === 'productGrid') {
        return {
          blockType: 'productGrid',
          heading: block.data.heading?.tr,
          description: block.data.description?.tr,
          source: block.data.source,
          limit: block.data.limit,
          columns: block.data.columns,
          showCTA: block.data.showCTA,
          ctaLink: block.data.ctaLink,
          ctaLabel: block.data.ctaLabel?.tr,
        }
      }

      return block
    })

    // Sayfa oluştur - TR
    const created = await payload.create({
      collection: 'pages',
      data: {
        title: page.title.tr,
        slug: page.slug,
        heroType: page.heroType,
        heroImage: heroImageId,
        heroSubtitle: page.heroSubtitle?.tr,
        content: contentBlocks,
        status: 'published',
        _status: 'published',
        showInNav: true,
        navOrder: 2,
        meta: page.seo
          ? {
              title: page.seo.metaTitle,
              description: page.seo.metaDescription,
            }
          : undefined,
      },
      locale: 'tr',
      draft: false,
    })

    // EN içerik blokları
    const contentBlocksEn = page.content.map((block) => {
      if (block.blockType === 'content') {
        return {
          blockType: 'content',
          columns: block.data.columns || 'one',
          backgroundColor: block.data.backgroundColor || 'white',
          paddingTop: 'medium',
          paddingBottom: 'medium',
          contentItems: block.data.contentItems.map(
            (item: { content: { tr: string; en?: string } }) => ({
              content: textToLexical(item.content.en || item.content.tr),
            })
          ),
        }
      }

      if (block.blockType === 'productGrid') {
        return {
          blockType: 'productGrid',
          heading: block.data.heading?.en,
          description: block.data.description?.en,
          source: block.data.source,
          limit: block.data.limit,
          columns: block.data.columns,
          showCTA: block.data.showCTA,
          ctaLink: block.data.ctaLink,
          ctaLabel: block.data.ctaLabel?.en,
        }
      }

      return block
    })

    // EN
    await payload.update({
      collection: 'pages',
      id: created.id,
      data: {
        title: page.title.en,
        heroSubtitle: page.heroSubtitle?.en,
        content: contentBlocksEn,
      },
      locale: 'en',
      draft: false,
    })

    pageMapping[page.wpId] = created.id
    console.log(`  ✅ ${page.title.tr}`)
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function migrateFromWordPressFull() {
  const payload = await getPayload({ config })

  console.log('🚀 WordPress\'ten Payload CMS\'e Tam Migrasyon Başlıyor...')
  console.log('   - Medya dosyaları indirilecek ve yüklenecek')
  console.log('   - HTML içerik Lexical formatına dönüştürülecek')
  console.log('   - SEO verileri aktarılacak')
  console.log('   - Sayfalar oluşturulacak\n')

  // Sayfaları migrate et
  await migratePages(payload)

  // Kategorileri migrate et
  await migrateCategories(payload)

  // Ürünleri migrate et
  await migrateProducts(payload)

  // Temp dizinini temizle
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true })
  }

  console.log('\n🎉 Tam migrasyon tamamlandı!')
  console.log(`\n📊 Özet:`)
  console.log(`   - ${wpPages.length} sayfa`)
  console.log(`   - ${wpCategories.length} kategori`)
  console.log(`   - ${wpProducts.length} ürün`)
  console.log(`   - ${Object.keys(mediaMapping).length} medya dosyası`)

  process.exit(0)
}

migrateFromWordPressFull().catch((err) => {
  console.error('❌ Migrasyon hatası:', err)
  process.exit(1)
})
