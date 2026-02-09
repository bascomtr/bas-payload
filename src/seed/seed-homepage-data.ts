import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function seedHomepageData() {
  const payload = await getPayload({ config })

  console.log('🌱 Seeding homepage data...')

  // 1. Update Homepage Global - Enable featured sections
  console.log('Updating homepage global...')
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      showFeaturedProducts: true,
      featuredProductsTitle: 'Öne Çıkan Ürünlerimiz',
      featuredProductsLimit: 6,
      showFeaturedProjects: true,
      featuredProjectsTitle: 'Referans Projelerimiz',
      featuredProjectsLimit: 3,
      showLatestNews: true,
      latestNewsTitle: 'Son Haberler',
      latestNewsLimit: 4,
    },
    locale: 'tr',
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      showFeaturedProducts: true,
      featuredProductsTitle: 'Featured Products',
      featuredProductsLimit: 6,
      showFeaturedProjects: true,
      featuredProjectsTitle: 'Featured Projects',
      featuredProjectsLimit: 3,
      showLatestNews: true,
      latestNewsTitle: 'Latest News',
      latestNewsLimit: 4,
    },
    locale: 'en',
  })
  console.log('✅ Homepage global updated')

  // 2. Mark some products as featured
  console.log('Marking products as featured...')
  const allProducts = await payload.find({
    collection: 'products',
    limit: 100,
  })

  if (allProducts.docs.length === 0) {
    console.log('⚠️  No products found. Please run seed script first: pnpm run seed')
  } else {
    // First, publish any draft products
    const draftProducts = allProducts.docs.filter((p) => p.status === 'draft')
    for (const product of draftProducts.slice(0, 6)) {
      await payload.update({
        collection: 'products',
        id: typeof product.id === 'string' ? product.id : String(product.id),
        data: {
          status: 'published',
          featured: true,
        },
      })
    }

    const publishedProducts = allProducts.docs.filter((p) => p.status === 'published')
    if (publishedProducts.length > 0) {
      // Mark first 6 products as featured
      const productsToFeature = publishedProducts.slice(0, 6)
      for (const product of productsToFeature) {
        await payload.update({
          collection: 'products',
          id: typeof product.id === 'string' ? product.id : String(product.id),
          data: {
            featured: true,
          },
        })
      }
      console.log(`✅ Marked ${productsToFeature.length} products as featured`)
    } else {
      console.log('⚠️  No published products found to feature')
    }
  }

  // 3. Mark some projects as featured
  console.log('Marking projects as featured...')
  const allProjects = await payload.find({
    collection: 'projects',
    limit: 100,
  })

  if (allProjects.docs.length === 0) {
    console.log('⚠️  No projects found. Please create projects in admin panel.')
  } else {
    // First, publish any draft projects
    const draftProjects = allProjects.docs.filter((p) => p.status === 'draft')
    for (const project of draftProjects.slice(0, 3)) {
      await payload.update({
        collection: 'projects',
        id: typeof project.id === 'string' ? project.id : String(project.id),
        data: {
          status: 'published',
          featured: true,
        },
      })
    }

    const publishedProjects = allProjects.docs.filter((p) => p.status === 'published')
    if (publishedProjects.length > 0) {
      // Mark first 3 projects as featured
      const projectsToFeature = publishedProjects.slice(0, 3)
      for (const project of projectsToFeature) {
        await payload.update({
          collection: 'projects',
          id: typeof project.id === 'string' ? project.id : String(project.id),
          data: {
            featured: true,
          },
        })
      }
      console.log(`✅ Marked ${projectsToFeature.length} projects as featured`)
    } else {
      console.log('⚠️  No published projects found to feature')
    }
  }

  // 4. Ensure we have published news
  console.log('Checking news...')
  const news = await payload.find({
    collection: 'news',
    limit: 100,
  })

  const publishedNews = news.docs.filter((n) => n.status === 'published')
  if (publishedNews.length === 0) {
    console.log('⚠️  No published news found. Creating sample news...')
    
    // Create sample news if none exist
    const sampleNews = [
      {
        title: 'BAS Endüstriyel Yeni Tesis Açılışı',
        excerpt: 'BAS Endüstriyel, üretim kapasitesini artırmak için yeni tesisini açtı.',
        status: 'published',
        publishedAt: new Date().toISOString(),
        locale: 'tr',
      },
      {
        title: 'NIRVIS Optik Separatör Teknolojisi',
        excerpt: 'Yapay zeka destekli optik ayırma teknolojimiz ile endüstriyel geri dönüşümde yeni bir dönem başlıyor.',
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        locale: 'tr',
      },
      {
        title: 'Uluslararası Proje Başarısı',
        excerpt: 'Avrupa\'da gerçekleştirdiğimiz büyük ölçekli cevher zenginleştirme projesi başarıyla tamamlandı.',
        status: 'published',
        publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        locale: 'tr',
      },
      {
        title: 'Yeni Ürün Lansmanı',
        excerpt: 'Yeni nesil elektromanyetik separatör serimiz piyasaya çıktı.',
        status: 'published',
        publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        locale: 'tr',
      },
    ]

    for (const newsItem of sampleNews) {
      const created = await payload.create({
        collection: 'news',
        data: newsItem,
        locale: 'tr',
      })
      
      // Create English version if needed
      if (created.id) {
        const enTitles: Record<string, string> = {
          'BAS Endüstriyel Yeni Tesis Açılışı': 'BAS Industrial New Facility Opening',
          'NIRVIS Optik Separatör Teknolojisi': 'NIRVIS Optical Separator Technology',
          'Uluslararası Proje Başarısı': 'International Project Success',
          'Yeni Ürün Lansmanı': 'New Product Launch',
        }
        
        const enExcerpts: Record<string, string> = {
          'BAS Endüstriyel Yeni Tesis Açılışı': 'BAS Industrial opened its new facility to increase production capacity.',
          'NIRVIS Optik Separatör Teknolojisi': 'A new era in industrial recycling begins with our AI-powered optical separation technology.',
          'Uluslararası Proje Başarısı': 'Our large-scale ore enrichment project in Europe has been successfully completed.',
          'Yeni Ürün Lansmanı': 'Our new generation electromagnetic separator series has been launched.',
        }
        
        await payload.update({
          collection: 'news',
          id: typeof created.id === 'string' ? created.id : String(created.id),
          data: {
            title: enTitles[newsItem.title] || newsItem.title,
            excerpt: enExcerpts[newsItem.title] || newsItem.excerpt,
          },
          locale: 'en',
        })
      }
    }
    console.log(`✅ Created ${sampleNews.length} sample news items`)
  } else {
    console.log(`✅ Found ${publishedNews.length} published news items`)
  }

  console.log('✅ Homepage data seeding completed!')
}

seedHomepageData()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
