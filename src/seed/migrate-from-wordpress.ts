import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import * as fs from 'fs'
import * as path from 'path'

/**
 * WordPress'ten Payload CMS'e Migrasyon Scripti
 *
 * Bu script, u9222084_bas.sql dosyasından parse edilmiş verileri
 * Payload CMS'e aktarır.
 *
 * Kullanım:
 * 1. Önce SQL dosyasından verileri ayrıştırın (parse-wordpress-sql.ts)
 * 2. Sonra bu scripti çalıştırın
 */

// WordPress'ten çıkarılan kategori verileri
const wpCategories = [
  {
    wpId: 88,
    slug: 'cevher-zenginlestirme-ekipmanlari',
    title: {
      tr: 'Cevher Zenginleştirme Ekipmanları',
      en: 'Ore Enrichment Equipment',
      es: 'Equipos de Enriquecimiento de Minerales',
    },
  },
  {
    wpId: 92,
    slug: 'metal-dedektorleri',
    title: {
      tr: 'Metal Dedektörler',
      en: 'Metal Detectors',
      es: 'Detectores de Metal',
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
  },
  {
    wpId: 100,
    slug: 'demanyetizorler',
    title: {
      tr: 'Demanyetizerler',
      en: 'Demagnetizers',
      es: 'Desmagnetizadores',
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
  },
  {
    wpId: 108,
    slug: 'tasima-ve-saklama-ekipmanlari',
    title: {
      tr: 'Taşıma ve Saklama Ekipmanları',
      en: 'Conveying and Storage Equipment',
      es: 'Equipos de Transporte y Almacenamiento',
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
  },
]

// WordPress'ten çıkarılan ürün verileri (örnek)
// Bu veriler SQL dosyasından parse edilmelidir
const wpProducts = [
  // Cevher Zenginleştirme Ekipmanları (categoryWpId: 88)
  {
    wpId: 934,
    categoryWpId: 88,
    slug: 'kuru-manyetik-tambur-seperatorler',
    title: {
      tr: 'Kuru Manyetik Tambur Seperatörler',
      en: 'Dry Magnetic Drum Separators',
    },
    shortDescription: {
      tr: 'Kuru ortamda cevher ve metal ayrıştırma işlemleri için tasarlanmış yüksek performanslı tambur seperatörler.',
      en: 'High-performance drum separators designed for ore and metal separation in dry environments.',
    },
    keywords: 'tambur separator; manyetik tambur separator',
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
      tr: 'Yaş ortamda cevher zenginleştirme işlemleri için özel tasarlanmış manyetik tambur sistemleri.',
      en: 'Magnetic drum systems specially designed for ore enrichment in wet environments.',
    },
    keywords: 'yaş manyetik separator; mikronize manyetik tambur; yaş tambur; manyetik tambur',
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
      tr: 'Yüksek manyetik alan şiddetine sahip roll tipi seperatörler.',
      en: 'Roll type separators with high magnetic field intensity.',
    },
    keywords: 'manyetik separator; roll manyetik separator; yüksek manyetik alan',
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
      tr: 'Yüksek manyetik alan şiddeti ile ince tane boyutundaki manyetik minerallerin ayrıştırılması için tasarlanmıştır.',
      en: 'Designed for separation of fine-grained magnetic minerals with high magnetic field intensity.',
    },
    keywords: 'yüksek manyetik alan; manyetik separator; elektromanyetik separator',
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
      tr: 'Zayıf manyetik minerallerin yaş ortamda yüksek verimle ayrıştırılması için kullanılır.',
      en: 'Used for high efficiency separation of weakly magnetic minerals in wet environment.',
    },
    keywords: 'yüksek alan şiddetli manyetik separator; manyetik separator; elektromanyetik separator',
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
      tr: 'Cevher hazırlama ve sınıflandırma işlemleri için spiral ve mekanik klasifikatörler.',
      en: 'Spiral and mechanical classifiers for ore preparation and classification.',
    },
    keywords: '',
    order: 6,
  },
  // Metal Seperatörler (categoryWpId: 94)
  {
    wpId: 961,
    categoryWpId: 94,
    slug: 'elektromanyetik-bant-ustu-metal-seperatorler',
    title: {
      tr: 'Elektromanyetik Bant Üstü Metal Seperatörler',
      en: 'Electromagnetic Overbelt Metal Separators',
    },
    shortDescription: {
      tr: 'Konveyör bantları üzerinde ferrous metallerin yüksek verimle ayrıştırılması için elektromanyetik seperatörler.',
      en: 'Electromagnetic separators for high efficiency separation of ferrous metals on conveyor belts.',
    },
    keywords: 'elektromanyetik separator; elektromanyetik metal separator; bant üstü separator',
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
      tr: 'Doğal mıknatıs teknolojisi ile enerji tasarrufu sağlayan bant üstü metal seperatörler.',
      en: 'Overbelt metal separators with permanent magnet technology providing energy savings.',
    },
    keywords: 'metal tutucu; manyetik tutucu; bant üstü tutucu; bantlı separator; konveyor ustu metal separator',
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
      tr: 'Çubuk mıknatıs, ızgara mıknatıs ve çekmeceli seperatör sistemleri.',
      en: 'Bar magnet, grate magnet and drawer separator systems.',
    },
    keywords: 'bar separatör; çubuk mıknatıs;',
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
      tr: 'Alüminyum, bakır ve diğer non-ferrous metallerin ayrıştırılması için eddy current teknolojisi.',
      en: 'Eddy current technology for separation of aluminum, copper and other non-ferrous metals.',
    },
    keywords: 'eddy current separatör; non ferrous metal separatör; non-ferrous; eddy current',
    order: 4,
  },
  // Metal Dedektörler (categoryWpId: 92)
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
    keywords: 'metal dedektör; konveyör tipi metal dedektör',
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
      tr: 'Ekonomik çözüm sunan tek sensörlü metal dedektör sistemleri.',
      en: 'Single sensor metal detector systems offering economical solutions.',
    },
    keywords: 'tek sensörlü metal dedektör',
    order: 2,
  },
  // Demanyetizerler (categoryWpId: 100)
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
    keywords: '',
    order: 1,
  },
  // Elektromanyetik Kaldıraçlar (categoryWpId: 104)
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
    keywords: 'hurda magnet; elektromagnet; elektromanyetik kaldıraç',
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
    keywords: 'elektro magnet; magnet; sac kaldırıcı',
    order: 2,
  },
  // Taşıma ve Saklama Ekipmanları (categoryWpId: 108)
  {
    wpId: 976,
    categoryWpId: 108,
    slug: 'bantli-konveyorler',
    title: {
      tr: 'Bantlı Konveyörler',
      en: 'Belt Conveyors',
    },
    shortDescription: {
      tr: 'Endüstriyel malzeme taşıma için bantlı konveyör sistemleri.',
      en: 'Belt conveyor systems for industrial material handling.',
    },
    keywords: '',
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
    keywords: '',
    order: 2,
  },
  // Besleyiciler (categoryWpId: 112)
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
    keywords: '',
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
    keywords: '',
    order: 2,
  },
]

// WordPress post_parent -> Payload category ID mapping
const categoryMapping: Record<number, string> = {}

async function migrateFromWordPress() {
  const payload = await getPayload({ config })

  console.log('🚀 WordPress\'ten Payload CMS\'e Migrasyon Başlıyor...\n')

  // 1. Önce mevcut kategorileri sil (opsiyonel - temiz başlangıç için)
  // await cleanDatabase(payload)

  // 2. Kategorileri oluştur
  console.log('📁 Kategoriler oluşturuluyor...')
  for (const cat of wpCategories) {
    const existing = await payload.find({
      collection: 'product-categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      const created = await payload.create({
        collection: 'product-categories',
        data: {
          title: cat.title.tr,
          slug: cat.slug,
          order: wpCategories.indexOf(cat),
        },
        locale: 'tr',
      })

      // İngilizce
      await payload.update({
        collection: 'product-categories',
        id: created.id,
        data: { title: cat.title.en },
        locale: 'en',
      })

      // İspanyolca
      if (cat.title.es) {
        await payload.update({
          collection: 'product-categories',
          id: created.id,
          data: { title: cat.title.es },
          locale: 'es',
        })
      }

      categoryMapping[cat.wpId] = created.id
      console.log(`  ✅ ${cat.title.tr}`)
    } else {
      categoryMapping[cat.wpId] = existing.docs[0].id
      console.log(`  ⏭️  ${cat.title.tr} (zaten mevcut)`)
    }
  }

  // 3. Ürünleri oluştur
  console.log('\n📦 Ürünler oluşturuluyor...')
  for (const product of wpProducts) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      const categoryId = categoryMapping[product.categoryWpId]

      if (!categoryId) {
        console.log(`  ⚠️  ${product.title.tr} - Kategori bulunamadı (wpId: ${product.categoryWpId})`)
        continue
      }

      const created = await payload.create({
        collection: 'products',
        data: {
          title: product.title.tr,
          slug: product.slug,
          shortDescription: product.shortDescription.tr,
          category: categoryId,
          order: product.order,
          status: 'published',
          _status: 'published',
        },
        locale: 'tr',
        draft: false,
      })

      // İngilizce
      await payload.update({
        collection: 'products',
        id: created.id,
        data: {
          title: product.title.en,
          shortDescription: product.shortDescription.en,
        },
        locale: 'en',
        draft: false,
      })

      console.log(`  ✅ ${product.title.tr}`)
    } else {
      console.log(`  ⏭️  ${product.title.tr} (zaten mevcut)`)
    }
  }

  console.log('\n🎉 Migrasyon tamamlandı!')
  console.log(`\n📊 Özet:`)
  console.log(`   - ${wpCategories.length} kategori`)
  console.log(`   - ${wpProducts.length} ürün`)

  process.exit(0)
}

async function cleanDatabase(payload: Awaited<ReturnType<typeof getPayload>>) {
  console.log('🧹 Veritabanı temizleniyor...')

  // Önce ürünleri sil
  const products = await payload.find({
    collection: 'products',
    limit: 1000,
  })

  for (const product of products.docs) {
    await payload.delete({
      collection: 'products',
      id: product.id,
    })
  }
  console.log(`   - ${products.totalDocs} ürün silindi`)

  // Sonra kategorileri sil
  const categories = await payload.find({
    collection: 'product-categories',
    limit: 1000,
  })

  for (const cat of categories.docs) {
    await payload.delete({
      collection: 'product-categories',
      id: cat.id,
    })
  }
  console.log(`   - ${categories.totalDocs} kategori silindi`)
}

migrateFromWordPress().catch((err) => {
  console.error('❌ Migrasyon hatası:', err)
  process.exit(1)
})
