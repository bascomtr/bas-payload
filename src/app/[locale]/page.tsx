import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { HeroSlider } from '@/components/sections/HeroSlider'
import { Stats } from '@/components/sections/Stats'
import { CategoryGrid } from '@/components/sections/CategoryGrid'
import { AboutPreview } from '@/components/sections/AboutPreview'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { FeaturedProjects } from '@/components/sections/FeaturedProjects'
import { LatestNews } from '@/components/sections/LatestNews'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'

interface HomePageProps {
  params: Promise<{ locale: Locale }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch homepage data
  const homepage = await payload.findGlobal({
    slug: 'homepage',
    locale,
    depth: 2,
  })

  // Fetch product categories
  const productCategories = await payload.find({
    collection: 'product-categories',
    locale,
    limit: 6,
    sort: 'order',
  })

  // Fetch featured products if enabled
  const featuredProducts = homepage?.showFeaturedProducts
    ? await payload.find({
        collection: 'products',
        locale,
        where: {
          and: [
            { featured: { equals: true } },
            { status: { equals: 'published' } },
          ],
        },
        limit: homepage?.featuredProductsLimit || 6,
        depth: 2,
      })
    : null

  // Fetch featured projects if enabled
  const featuredProjects = homepage?.showFeaturedProjects
    ? await payload.find({
        collection: 'projects',
        locale,
        where: {
          and: [
            { featured: { equals: true } },
            { status: { equals: 'published' } },
          ],
        },
        limit: homepage?.featuredProjectsLimit || 3,
        depth: 1,
      })
    : null

  // Fetch latest news if enabled
  const latestNews = homepage?.showLatestNews
    ? await payload.find({
        collection: 'news',
        locale,
        where: {
          status: { equals: 'published' },
        },
        limit: homepage?.latestNewsLimit || 4,
        sort: '-publishedAt',
        depth: 1,
      })
    : null

  // Stats data
  const stats = [
    { value: '25+', label: locale === 'tr' ? 'Yıllık Deneyim' : 'Years Experience' },
    { value: '500+', label: locale === 'tr' ? 'Tamamlanan Proje' : 'Completed Projects' },
    { value: '50+', label: locale === 'tr' ? 'Ülkeye İhracat' : 'Export Countries' },
    { value: '100+', label: locale === 'tr' ? 'Aktif Müşteri' : 'Active Clients' },
  ]

  return (
    <>
      {/* Hero Section */}
      {homepage?.heroSlides && homepage.heroSlides.length > 0 ? (
        <HeroSlider slides={homepage.heroSlides} locale={locale} />
      ) : (
        <HeroSlider slides={[]} locale={locale} />
      )}

      {/* Stats Section */}
      <Stats 
        heading={locale === 'tr' ? 'Rakamlarla BAS' : 'BAS in Numbers'} 
        stats={stats} 
      />

      {/* Categories Section */}
      {productCategories.docs.length > 0 && (
        <CategoryGrid
          categories={productCategories.docs}
          locale={locale}
          title={locale === 'tr' ? 'Ürün Kategorilerimiz' : 'Our Product Categories'}
        />
      )}

      {/* About Preview Section */}
      <AboutPreview locale={locale} dict={dict} />

      {/* Dynamic Content Blocks */}
      {homepage?.content && homepage.content.length > 0 && (
        <RenderBlocks blocks={homepage.content} locale={locale} />
      )}

      {/* Featured Products */}
      {featuredProducts && featuredProducts.docs.length > 0 && (
        <FeaturedProducts
          products={featuredProducts.docs}
          title={homepage?.featuredProductsTitle || 'Öne Çıkan Ürünlerimiz'}
          locale={locale}
          dict={dict}
        />
      )}

      {/* Featured Projects */}
      {featuredProjects && featuredProjects.docs.length > 0 && (
        <FeaturedProjects
          projects={featuredProjects.docs}
          title={homepage?.featuredProjectsTitle || dict.projects?.title || 'Referans Projelerimiz'}
          locale={locale}
          dict={dict}
        />
      )}

      {/* Latest News */}
      {latestNews && latestNews.docs.length > 0 && (
        <LatestNews
          news={latestNews.docs}
          title={homepage?.latestNewsTitle || dict.news?.latestNews || 'Son Haberler'}
          locale={locale}
          dict={dict}
        />
      )}
    </>
  )
}
