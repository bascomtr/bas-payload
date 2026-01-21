import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config })

  console.log('🌱 Seeding database...')

  // 1. Create admin user if not exists
  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (existingUsers.totalDocs === 0) {
    console.log('Creating admin user...')
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@bas.com.tr',
        password: 'Admin123!',
        name: 'Admin',
        roles: ['admin'],
      },
    })
    console.log('✅ Admin user created')
  }

  // 2. Update Site Settings
  console.log('Updating site settings...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'BAS Endüstriyel',
      siteDescription:
        'Manyetik separasyon sistemleri, cevher zenginleştirme ve endüstriyel ayırma teknolojilerinde Türkiye\'nin öncü firması.',
      companyName: 'BAS Endüstriyel Çözümler ve Uygulama Ltd. Şti.',
      address: 'BAŞKENT OSB BAŞKENT BULV. 2. CAD NO:5 SİNCAN ANKARA TÜRKİYE',
      phone: '+90 312 815 41 52',
      email: 'info@bas.com.tr',
      workingHours: 'Pazartesi - Cuma: 08:30 - 18:00',
      social: {
        linkedin: 'https://www.linkedin.com/company/bas-endustriyel',
        youtube: 'https://www.youtube.com/@basendustriyel',
      },
      defaultMetaTitle: 'BAS Endüstriyel | Manyetik Seperatör Sistemleri',
      defaultMetaDescription:
        'Manyetik separasyon, cevher zenginleştirme, metal ayırma ve endüstriyel taşıma sistemlerinde uzman mühendislik firması. 25+ yıllık deneyim.',
      footerText:
        'BAS Endüstriyel, manyetik separasyon ve cevher zenginleştirme teknolojilerinde Türkiye\'nin lider firmasıdır.',
      copyrightText: '© 2024 BAS Endüstriyel. Tüm hakları saklıdır.',
    },
    locale: 'tr',
  })

  // English locale
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'BAS Industrial',
      siteDescription:
        'Turkey\'s leading company in magnetic separation systems, ore enrichment and industrial separation technologies.',
      address: 'BAŞKENT OSB BAŞKENT BULV. 2. CAD NO:5 SİNCAN ANKARA TURKEY',
      workingHours: 'Monday - Friday: 08:30 - 18:00',
      defaultMetaTitle: 'BAS Industrial | Magnetic Separator Systems',
      defaultMetaDescription:
        'Expert engineering company in magnetic separation, ore enrichment, metal separation and industrial conveying systems. 25+ years of experience.',
      footerText:
        'BAS Industrial is Turkey\'s leading company in magnetic separation and ore enrichment technologies.',
      copyrightText: '© 2024 BAS Industrial. All rights reserved.',
    },
    locale: 'en',
  })
  console.log('✅ Site settings updated')

  // 3. Create Product Categories
  console.log('Creating product categories...')

  const categories = [
    {
      name: { tr: 'Metal Separatörler', en: 'Metal Separators', es: 'Separadores de Metal', ru: 'Металлические сепараторы' },
      slug: 'metal-seperatorler',
      description: {
        tr: 'Ferrous ve non-ferrous metallerin ayrıştırılması için yüksek performanslı manyetik ve elektromanyetik separatör sistemleri.',
        en: 'High-performance magnetic and electromagnetic separator systems for separating ferrous and non-ferrous metals.',
      },
    },
    {
      name: { tr: 'Manyetik Tambur Separatörler', en: 'Magnetic Drum Separators', es: 'Separadores de Tambor Magnético', ru: 'Магнитные барабанные сепараторы' },
      slug: 'manyetik-tambur-seperatorler',
      description: {
        tr: 'Yaş ve kuru ortamlarda cevher zenginleştirme için tambur tipi manyetik separatörler.',
        en: 'Drum type magnetic separators for ore enrichment in wet and dry environments.',
      },
    },
    {
      name: { tr: 'Elektromanyetik Separatörler', en: 'Electromagnetic Separators', es: 'Separadores Electromagnéticos', ru: 'Электромагнитные сепараторы' },
      slug: 'elektromanyetik-seperatorler',
      description: {
        tr: 'Yüksek manyetik alan şiddeti gerektiren uygulamalar için elektromanyetik bant üstü separatörler.',
        en: 'Electromagnetic overbelt separators for applications requiring high magnetic field intensity.',
      },
    },
    {
      name: { tr: 'Optik Separatörler', en: 'Optical Separators', es: 'Separadores Ópticos', ru: 'Оптические сепараторы' },
      slug: 'optik-seperatorler',
      description: {
        tr: 'AI destekli renk ve malzeme tanıma ile çalışan optik ayırma sistemleri.',
        en: 'Optical sorting systems with AI-powered color and material recognition.',
      },
    },
    {
      name: { tr: 'Taşıma Sistemleri', en: 'Conveying Systems', es: 'Sistemas de Transporte', ru: 'Транспортные системы' },
      slug: 'tasima-sistemleri',
      description: {
        tr: 'Endüstriyel konveyör bantları, elevatörler ve malzeme taşıma ekipmanları.',
        en: 'Industrial conveyor belts, elevators and material handling equipment.',
      },
    },
    {
      name: { tr: 'Cevher Zenginleştirme', en: 'Ore Enrichment', es: 'Enriquecimiento de Minerales', ru: 'Обогащение руды' },
      slug: 'cevher-zenginlestirme',
      description: {
        tr: 'Madencilik ve cevher işleme tesisleri için komple zenginleştirme çözümleri.',
        en: 'Complete enrichment solutions for mining and ore processing plants.',
      },
    },
  ]

  const categoryIds: Record<string, number> = {}

  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'product-categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      // Create with Turkish locale first
      const created = await payload.create({
        collection: 'product-categories',
        data: {
          title: cat.name.tr,
          slug: cat.slug,
        },
        locale: 'tr',
      })

      // Update other locales
      await payload.update({
        collection: 'product-categories',
        id: created.id,
        data: {
          title: cat.name.en,
          slug: cat.slug,
        },
        locale: 'en',
      })

      if (cat.name.es) {
        await payload.update({
          collection: 'product-categories',
          id: created.id,
          data: {
            title: cat.name.es,
            slug: cat.slug,
          },
          locale: 'es',
        })
      }

      if (cat.name.ru) {
        await payload.update({
          collection: 'product-categories',
          id: created.id,
          data: {
            title: cat.name.ru,
            slug: cat.slug,
          },
          locale: 'ru',
        })
      }

      categoryIds[cat.slug] = created.id
      console.log(`  ✅ Category: ${cat.name.tr}`)
    } else {
      categoryIds[cat.slug] = existing.docs[0].id
    }
  }

  // 4. Create Products
  console.log('Creating products...')

  const products = [
    {
      name: { tr: 'Doğal Manyetik Bant Üstü Metal Separatör (MBS)', en: 'Permanent Magnetic Overbelt Metal Separator (MBS)' },
      slug: 'dogal-manyetik-bant-ustu-metal-seperator',
      category: 'metal-seperatorler',
      shortDescription: {
        tr: 'Konveyör bantlarının üzerinde metal ayrılması için kullanılan doğal mıknatıslı separatör sistemi.',
        en: 'Permanent magnet separator system used for metal separation on conveyor belts.',
      },
      specifications: [
        { key: { tr: 'Manyetik Alan', en: 'Magnetic Field' }, value: '4400 Gauss (Y35)' },
        { key: { tr: 'Bant Genişliği', en: 'Belt Width' }, value: '800 - 2000 mm' },
        { key: { tr: 'Motor Gücü', en: 'Motor Power' }, value: '2.2 - 7.5 kW' },
      ],
      featured: true,
    },
    {
      name: { tr: 'Elektromanyetik Bant Üstü Separatör (EMBS)', en: 'Electromagnetic Overbelt Separator (EMBS)' },
      slug: 'elektromanyetik-bant-ustu-seperator',
      category: 'elektromanyetik-seperatorler',
      shortDescription: {
        tr: 'Yüksek manyetik alan şiddeti ile büyük metal parçalarını ayırmak için tasarlanmış elektromanyetik separatör.',
        en: 'Electromagnetic separator designed to separate large metal pieces with high magnetic field intensity.',
      },
      specifications: [
        { key: { tr: 'Manyetik Alan', en: 'Magnetic Field' }, value: '1750 Gauss @ 500mm' },
        { key: { tr: 'Alan Boyutu', en: 'Field Size' }, value: '2400 x 2750 mm' },
        { key: { tr: 'Manyetik Güç', en: 'Magnetic Power' }, value: '34 kW' },
        { key: { tr: 'Toplam Güç', en: 'Total Power' }, value: '55 kW' },
      ],
      featured: true,
    },
    {
      name: { tr: 'Yaş Manyetik Tambur Separatör', en: 'Wet Magnetic Drum Separator' },
      slug: 'yas-manyetik-tambur-seperator',
      category: 'manyetik-tambur-seperatorler',
      shortDescription: {
        tr: 'Oksit ve hidroksitler başta olmak üzere düşük tenörlü cevherlerin zenginleştirilmesinde kullanılır.',
        en: 'Used for enrichment of low-grade ores, especially oxides and hydroxides.',
      },
      specifications: [
        { key: { tr: 'Tambur Çapı', en: 'Drum Diameter' }, value: '600 - 1200 mm' },
        { key: { tr: 'Tambur Uzunluğu', en: 'Drum Length' }, value: '900 - 3000 mm' },
        { key: { tr: 'Kapasite', en: 'Capacity' }, value: '5 - 150 t/h' },
      ],
      featured: true,
    },
    {
      name: { tr: 'Kuru Manyetik Tambur Separatör', en: 'Dry Magnetic Drum Separator' },
      slug: 'kuru-manyetik-tambur-seperator',
      category: 'manyetik-tambur-seperatorler',
      shortDescription: {
        tr: 'Kuru ortamda cevher ve metal ayrıştırma işlemleri için tasarlanmış tambur separatör.',
        en: 'Drum separator designed for ore and metal separation in dry environment.',
      },
      specifications: [
        { key: { tr: 'Tambur Çapı', en: 'Drum Diameter' }, value: '300 - 900 mm' },
        { key: { tr: 'Manyetik Alan', en: 'Magnetic Field' }, value: '1000 - 6000 Gauss' },
      ],
      featured: false,
    },
    {
      name: { tr: 'Paslanmaz Çelik Separatör', en: 'Stainless Steel Separator' },
      slug: 'paslanmaz-celik-seperator',
      category: 'metal-seperatorler',
      shortDescription: {
        tr: 'Geri dönüşüm tesislerinde alaşımlı metaller ve paslanmaz çelikleri ayırmak için kullanılır.',
        en: 'Used to separate alloy metals and stainless steels in recycling plants.',
      },
      specifications: [
        { key: { tr: 'Bant Genişliği', en: 'Belt Width' }, value: '1000 - 1500 mm' },
        { key: { tr: 'Tambur Tipi', en: 'Drum Type' }, value: 'İkili Tambur' },
      ],
      featured: true,
    },
    {
      name: { tr: 'NIRVIS Optik Separatör', en: 'NIRVIS Optical Separator' },
      slug: 'nirvis-optik-seperator',
      category: 'optik-seperatorler',
      shortDescription: {
        tr: 'Yapay zeka destekli renk ve malzeme tanıma ile çalışan yüksek hassasiyetli optik ayırma sistemi.',
        en: 'High-precision optical sorting system with AI-powered color and material recognition.',
      },
      specifications: [
        { key: { tr: 'Teknoloji', en: 'Technology' }, value: 'AI + NIR Spektroskopi' },
        { key: { tr: 'Kapasite', en: 'Capacity' }, value: '2 - 10 t/h' },
      ],
      featured: true,
    },
    {
      name: { tr: 'Metal Dedektör - Tek Sensörlü', en: 'Metal Detector - Single Sensor' },
      slug: 'metal-detektor-tek-sensorlu',
      category: 'metal-seperatorler',
      shortDescription: {
        tr: 'Konveyör bantlarında metal kontaminasyonu tespit eden tek sensörlü dedektör sistemi.',
        en: 'Single sensor detector system for detecting metal contamination on conveyor belts.',
      },
      specifications: [
        { key: { tr: 'Algılama Hassasiyeti', en: 'Detection Sensitivity' }, value: 'Fe: 1.0mm, Non-Fe: 1.5mm' },
      ],
      featured: false,
    },
    {
      name: { tr: 'Elektromanyetik Kaldırıcı', en: 'Electromagnetic Lifter' },
      slug: 'elektromanyetik-kaldirici',
      category: 'tasima-sistemleri',
      shortDescription: {
        tr: 'Hurda işleme ve taşıma uygulamaları için elektromanyetik kaldırma sistemi.',
        en: 'Electromagnetic lifting system for scrap handling and transport applications.',
      },
      specifications: [
        { key: { tr: 'Kaldırma Kapasitesi', en: 'Lifting Capacity' }, value: '500 - 10000 kg' },
      ],
      featured: false,
    },
  ]

  for (const product of products) {
    const existing = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      const categoryId = categoryIds[product.category]

      const created = await payload.create({
        collection: 'products',
        data: {
          title: product.name.tr,
          slug: product.slug,
          shortDescription: product.shortDescription.tr,
          category: categoryId,
          featured: product.featured,
          status: 'published',
          _status: 'published',
          specifications: product.specifications?.map((spec) => ({
            label: spec.key.tr,
            value: spec.value,
          })),
        },
        locale: 'tr',
        draft: false,
      })

      // Update English locale
      await payload.update({
        collection: 'products',
        id: created.id,
        data: {
          title: product.name.en,
          slug: product.slug,
          shortDescription: product.shortDescription.en,
          specifications: product.specifications?.map((spec) => ({
            label: spec.key.en,
            value: spec.value,
          })),
        },
        locale: 'en',
        draft: false,
      })

      console.log(`  ✅ Product: ${product.name.tr}`)
    }
  }

  // 5. Update Homepage
  console.log('Updating homepage...')
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroType: 'slider',
      heroSlides: [
        {
          heading: 'Manyetik Separasyon Teknolojilerinde Öncü',
          subheading: 'Cevher zenginleştirme ve metal ayırma çözümlerinde 25 yılı aşkın deneyim',
          buttonLabel: 'Ürünlerimizi Keşfedin',
          buttonLink: '/tr/urunler',
        },
        {
          heading: 'Yerli Üretim, Dünya Standartları',
          subheading: 'Türkiye\'nin en büyük elektromanyetik separatör üreticisi',
          buttonLabel: 'Hakkımızda',
          buttonLink: '/tr/hakkimizda',
        },
        {
          heading: 'AI Destekli Optik Separasyon',
          subheading: 'NIRVIS teknolojisi ile akıllı malzeme ayrıştırma',
          buttonLabel: 'Detaylı Bilgi',
          buttonLink: '/tr/urunler/optik-seperatorler',
        },
      ],
      showFeaturedProducts: true,
      featuredProductsTitle: 'Öne Çıkan Ürünlerimiz',
      featuredProductsLimit: 6,
      showFeaturedProjects: true,
      featuredProjectsTitle: 'Referans Projelerimiz',
      featuredProjectsLimit: 3,
      showLatestNews: true,
      latestNewsTitle: 'Son Haberler',
      latestNewsLimit: 4,
      metaTitle: 'BAS Endüstriyel | Manyetik Seperatör Sistemleri',
      metaDescription:
        'Manyetik separasyon, cevher zenginleştirme, metal ayırma ve endüstriyel taşıma sistemlerinde Türkiye\'nin lider firması.',
      content: [
        {
          blockType: 'stats',
          heading: 'Rakamlarla BAS',
          stats: [
            { value: '25+', label: 'Yıllık Deneyim' },
            { value: '500+', label: 'Tamamlanan Proje' },
            { value: '50+', label: 'Ülkeye İhracat' },
            { value: '100+', label: 'Aktif Müşteri' },
          ],
        },
        {
          blockType: 'content',
          heading: 'Neden BAS?',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'BAS Endüstriyel olarak, manyetik separasyon ve cevher zenginleştirme alanında Türkiye\'nin öncü firmasıyız. Yerli üretim kapasitemiz ve Ar-Ge yatırımlarımız ile dünya standartlarında çözümler sunuyoruz.',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Madencilik, geri dönüşüm, çimento ve birçok endüstriyel sektörde güvenilir iş ortağınız olarak hizmet veriyoruz.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    locale: 'tr',
  })

  // English homepage
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroSlides: [
        {
          heading: 'Pioneer in Magnetic Separation Technologies',
          subheading: 'Over 25 years of experience in ore enrichment and metal separation solutions',
          buttonLabel: 'Explore Our Products',
          buttonLink: '/en/products',
        },
        {
          heading: 'Local Production, World Standards',
          subheading: 'Turkey\'s largest electromagnetic separator manufacturer',
          buttonLabel: 'About Us',
          buttonLink: '/en/about',
        },
        {
          heading: 'AI-Powered Optical Separation',
          subheading: 'Smart material sorting with NIRVIS technology',
          buttonLabel: 'Learn More',
          buttonLink: '/en/products/optical-separators',
        },
      ],
      featuredProductsTitle: 'Featured Products',
      featuredProjectsTitle: 'Reference Projects',
      latestNewsTitle: 'Latest News',
      metaTitle: 'BAS Industrial | Magnetic Separator Systems',
      metaDescription:
        'Turkey\'s leading company in magnetic separation, ore enrichment, metal separation and industrial conveying systems.',
      content: [
        {
          blockType: 'stats',
          heading: 'BAS in Numbers',
          stats: [
            { value: '25+', label: 'Years of Experience' },
            { value: '500+', label: 'Completed Projects' },
            { value: '50+', label: 'Export Countries' },
            { value: '100+', label: 'Active Clients' },
          ],
        },
        {
          blockType: 'content',
          heading: 'Why BAS?',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'As BAS Industrial, we are Turkey\'s pioneer in magnetic separation and ore enrichment. With our local production capacity and R&D investments, we offer world-class solutions.',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'We serve as your reliable business partner in mining, recycling, cement and many other industrial sectors.',
                    },
                  ],
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
      ],
    },
    locale: 'en',
  })

  console.log('✅ Homepage updated')

  // 6. Update Navigation
  console.log('Updating navigation...')
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      mainMenu: [
        { label: 'Ana Sayfa', type: 'external', externalLink: '/' },
        { 
          label: 'Kurumsal', 
          type: 'external', 
          externalLink: '/hakkimizda',
          children: [
            { label: 'Hakkımızda', type: 'external', externalLink: '/hakkimizda' },
            { label: 'Haberler', type: 'external', externalLink: '/haberler' },
            { label: 'Blog', type: 'external', externalLink: '/blog' },
            { label: 'Kalite Standartları', type: 'external', externalLink: '/kalite-standartlari' },
            { label: 'Kilometre Taşları', type: 'external', externalLink: '/kilometre-taslari' },
          ],
        },
        { 
          label: 'Ekipmanlarımız', 
          type: 'external', 
          externalLink: '/urunler',
          children: [
            { label: 'Cevher Zenginleştirme Ekipmanları', type: 'external', externalLink: '/urunler/cevher-zenginlestirme' },
            { label: 'Metal Seperatörler', type: 'external', externalLink: '/urunler/metal-seperatorler' },
            { label: 'Optik Separatörler', type: 'external', externalLink: '/urunler/optik-seperatorler' },
            { label: 'Elektromanyetik Kaldıraçlar', type: 'external', externalLink: '/urunler/elektromanyetik-kaldiraclar' },
            { label: 'Taşıma ve Saklama Ekipmanları', type: 'external', externalLink: '/urunler/tasima-sistemleri' },
            { label: 'Metal Dedektörleri ve Bant Kantarları', type: 'external', externalLink: '/urunler/metal-dedektorleri' },
            { label: 'Elektrostatik Seperatörler', type: 'external', externalLink: '/urunler/elektrostatik-seperatorler' },
          ],
        },
        { 
          label: 'Tesis ve Uygulama', 
          type: 'external', 
          externalLink: '/projeler',
          children: [
            { label: 'Cevher Zenginleştirme Tesisleri', type: 'external', externalLink: '/projeler/cevher-zenginlestirme-tesisleri' },
            { label: 'Cüruf Zenginleştirme Tesisleri', type: 'external', externalLink: '/projeler/curuf-zenginlestirme-tesisleri' },
            { label: 'Hurda Ayrıştırma Tesisleri', type: 'external', externalLink: '/projeler/hurda-ayristirma-tesisleri' },
          ],
        },
        { 
          label: 'Hizmetler', 
          type: 'external', 
          externalLink: '/hizmetler',
          children: [
            { label: 'Servis', type: 'external', externalLink: '/hizmetler/servis' },
            { label: 'Çözüm Merkezi', type: 'external', externalLink: '/hizmetler/cozum-merkezi' },
          ],
        },
        { label: 'Medya', type: 'external', externalLink: '/medya' },
        { label: 'İletişim', type: 'external', externalLink: '/iletisim' },
      ],
      footerColumns: [
        {
          title: 'Ekipmanlarımız',
          links: [
            { label: 'Cevher Zenginleştirme', type: 'external', externalLink: '/urunler/cevher-zenginlestirme' },
            { label: 'Metal Seperatörler', type: 'external', externalLink: '/urunler/metal-seperatorler' },
            { label: 'Optik Separatörler', type: 'external', externalLink: '/urunler/optik-seperatorler' },
            { label: 'Elektromanyetik Kaldıraçlar', type: 'external', externalLink: '/urunler/elektromanyetik-kaldiraclar' },
            { label: 'Taşıma Ekipmanları', type: 'external', externalLink: '/urunler/tasima-sistemleri' },
          ],
        },
        {
          title: 'Tesis ve Uygulama',
          links: [
            { label: 'Cevher Zenginleştirme Tesisleri', type: 'external', externalLink: '/projeler/cevher-zenginlestirme-tesisleri' },
            { label: 'Cüruf Zenginleştirme Tesisleri', type: 'external', externalLink: '/projeler/curuf-zenginlestirme-tesisleri' },
            { label: 'Hurda Ayrıştırma Tesisleri', type: 'external', externalLink: '/projeler/hurda-ayristirma-tesisleri' },
          ],
        },
        {
          title: 'Kurumsal',
          links: [
            { label: 'Hakkımızda', type: 'external', externalLink: '/hakkimizda' },
            { label: 'Haberler', type: 'external', externalLink: '/haberler' },
            { label: 'Kalite Standartları', type: 'external', externalLink: '/kalite-standartlari' },
            { label: 'İletişim', type: 'external', externalLink: '/iletisim' },
          ],
        },
      ],
      showTopBar: true,
      topBarContent: 'info@bas.com.tr | +90 312 815 41 52',
      topBarLinks: [],
    },
    locale: 'tr',
  })

  // Note: English navigation labels will be set via admin panel
  // because localized array fields require same array structure across locales

  console.log('✅ Navigation updated')

  // 7. Create Project Categories
  console.log('Creating project categories...')
  
  const projectCategories = [
    { name: { tr: 'Madencilik', en: 'Mining' }, slug: 'madencilik' },
    { name: { tr: 'Geri Dönüşüm', en: 'Recycling' }, slug: 'geri-donusum' },
    { name: { tr: 'Çimento', en: 'Cement' }, slug: 'cimento' },
  ]

  const projectCategoryIds: Record<string, string> = {}

  for (const cat of projectCategories) {
    const existing = await payload.find({
      collection: 'project-categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      const created = await payload.create({
        collection: 'project-categories',
        data: {
          title: cat.name.tr,
          slug: cat.slug,
        },
        locale: 'tr',
      })

      await payload.update({
        collection: 'project-categories',
        id: created.id,
        data: { title: cat.name.en, slug: cat.slug },
        locale: 'en',
      })

      projectCategoryIds[cat.slug] = created.id
      console.log(`  ✅ Project Category: ${cat.name.tr}`)
    } else {
      projectCategoryIds[cat.slug] = existing.docs[0].id
    }
  }

  // 8. Create Projects
  console.log('Creating projects...')

  const projects = [
    {
      name: { tr: 'Eti Maden Kırka Bor İşletmesi', en: 'Eti Maden Kirka Boron Plant' },
      slug: 'eti-maden-kirka-bor',
      category: 'madencilik',
      location: 'Eskişehir, Türkiye',
      shortDescription: {
        tr: 'Türkiye\'nin en büyük bor madeni tesisine komple manyetik separasyon sistemi kurulumu.',
        en: 'Complete magnetic separation system installation for Turkey\'s largest boron mine facility.',
      },
      featured: true,
    },
    {
      name: { tr: 'Demir Çelik Geri Dönüşüm Tesisi', en: 'Iron Steel Recycling Plant' },
      slug: 'demir-celik-geri-donusum',
      category: 'geri-donusum',
      location: 'İstanbul, Türkiye',
      shortDescription: {
        tr: 'Yüksek kapasiteli hurda metal ayrıştırma tesisi için elektromanyetik separatör sistemleri.',
        en: 'Electromagnetic separator systems for high-capacity scrap metal sorting facility.',
      },
      featured: true,
    },
    {
      name: { tr: 'Çimsa Çimento Fabrikası', en: 'Cimsa Cement Factory' },
      slug: 'cimsa-cimento-fabrikasi',
      category: 'cimento',
      location: 'Mersin, Türkiye',
      shortDescription: {
        tr: 'Çimento üretim hattına entegre metal dedektör ve separatör sistemleri.',
        en: 'Metal detector and separator systems integrated into cement production line.',
      },
      featured: true,
    },
    {
      name: { tr: 'Kazakistan Maden Projesi', en: 'Kazakhstan Mining Project' },
      slug: 'kazakistan-maden-projesi',
      category: 'madencilik',
      location: 'Nur-Sultan, Kazakistan',
      shortDescription: {
        tr: 'Orta Asya\'nın en büyük demir cevheri zenginleştirme tesislerinden biri.',
        en: 'One of the largest iron ore enrichment facilities in Central Asia.',
      },
      featured: false,
    },
  ]

  for (const project of projects) {
    const existing = await payload.find({
      collection: 'projects',
      where: { slug: { equals: project.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      const categoryId = projectCategoryIds[project.category]

      const created = await payload.create({
        collection: 'projects',
        data: {
          title: project.name.tr,
          slug: project.slug,
          shortDescription: project.shortDescription.tr,
          location: project.location,
          category: categoryId,
          featured: project.featured,
          status: 'published',
          _status: 'published',
        },
        locale: 'tr',
        draft: false,
      })

      await payload.update({
        collection: 'projects',
        id: created.id,
        data: {
          title: project.name.en,
          slug: project.slug,
          shortDescription: project.shortDescription.en,
        },
        locale: 'en',
        draft: false,
      })

      console.log(`  ✅ Project: ${project.name.tr}`)
    }
  }

  // 9. Create News
  console.log('Creating news...')

  const news = [
    {
      name: { tr: 'Türkiye\'nin En Büyük Elektromanyetik Separatörü Üretildi', en: 'Turkey\'s Largest Electromagnetic Separator Produced' },
      slug: 'turkiyenin-en-buyuk-elektromanyetik-seperatoru',
      excerpt: {
        tr: 'BAS Endüstriyel, 2400x2750mm boyutlarında, 34 kW manyetik güce sahip Türkiye\'nin en büyük elektromanyetik separatörünü üretti.',
        en: 'BAS Industrial produced Turkey\'s largest electromagnetic separator with dimensions of 2400x2750mm and 34 kW magnetic power.',
      },
      publishedAt: '2024-10-15T10:00:00.000Z',
    },
    {
      name: { tr: 'NIRVIS Optik Separatör Serisi Tanıtıldı', en: 'NIRVIS Optical Separator Series Introduced' },
      slug: 'nirvis-optik-seperator-serisi',
      excerpt: {
        tr: 'Yapay zeka destekli yeni nesil optik separatör serimiz NIRVIS, endüstriyel fuar etkinliğinde tanıtıldı.',
        en: 'Our new generation AI-powered optical separator series NIRVIS was introduced at the industrial fair event.',
      },
      publishedAt: '2024-09-20T09:00:00.000Z',
    },
    {
      name: { tr: 'Kazakistan\'a İhracat Anlaşması İmzalandı', en: 'Export Agreement Signed with Kazakhstan' },
      slug: 'kazakistan-ihracat-anlasmasi',
      excerpt: {
        tr: 'Orta Asya pazarındaki büyümemizi sürdürüyoruz. Kazakistan\'ın önde gelen madencilik şirketiyle stratejik ortaklık anlaşması imzaladık.',
        en: 'We continue our growth in the Central Asian market. We signed a strategic partnership agreement with a leading mining company in Kazakhstan.',
      },
      publishedAt: '2024-08-05T14:00:00.000Z',
    },
    {
      name: { tr: 'Ar-Ge Merkezimiz Tescillendi', en: 'Our R&D Center Registered' },
      slug: 'arge-merkezi-tescillendi',
      excerpt: {
        tr: 'Ankara\'daki üretim tesisimiz bünyesindeki Ar-Ge merkezimiz, T.C. Sanayi ve Teknoloji Bakanlığı tarafından tescillendi.',
        en: 'Our R&D center within our production facility in Ankara has been registered by the Ministry of Industry and Technology.',
      },
      publishedAt: '2024-06-12T11:00:00.000Z',
    },
  ]

  for (const item of news) {
    const existing = await payload.find({
      collection: 'news',
      where: { slug: { equals: item.slug } },
      limit: 1,
    })

    if (existing.totalDocs === 0) {
      const created = await payload.create({
        collection: 'news',
        data: {
          title: item.name.tr,
          slug: item.slug,
          excerpt: item.excerpt.tr,
          publishedAt: item.publishedAt,
          status: 'published',
          _status: 'published',
        },
        locale: 'tr',
        draft: false,
      })

      await payload.update({
        collection: 'news',
        id: created.id,
        data: {
          title: item.name.en,
          slug: item.slug,
          excerpt: item.excerpt.en,
        },
        locale: 'en',
        draft: false,
      })

      console.log(`  ✅ News: ${item.name.tr}`)
    }
  }

  console.log('\n🎉 Seeding completed!')
  console.log('\nAdmin credentials:')
  console.log('  Email: admin@bas.com.tr')
  console.log('  Password: Admin123!')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
