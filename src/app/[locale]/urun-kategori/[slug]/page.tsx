import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { ProductCard } from '@/components/cards/ProductCard'
import { RichText } from '@/components/ui/RichText'
import type { Media } from '@/payload-types'

// Static banner for category pages (uploaded to Payload media id=257)
const CATEGORY_BANNER_URL = '/api/media/file/category-banner.jpg'

interface CategoryPageProps {
  params: Promise<{ locale: Locale; slug: string }>
  searchParams: Promise<{ page?: string }>
}

// Dynamic rendering - skip static generation at build time
export const dynamic = 'force-dynamic'

export function generateStaticParams(): Array<{ locale: Locale; slug: string }> {
  return []
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const categories = await payload.find({
    collection: 'product-categories',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const category = categories.docs[0]

  if (!category) {
    return { title: 'Not Found' }
  }

  return {
    title: category.title,
    description:
      typeof category.description === 'object'
        ? undefined
        : category.description,
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `/${loc}/urun-kategori/${slug}`])
      ),
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { locale, slug } = await params
  const { page = '1' } = await searchParams
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const currentPage = parseInt(page, 10)
  const limit = 12

  // Fetch category
  const categories = await payload.find({
    collection: 'product-categories',
    locale,
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
  })

  const category = categories.docs[0]

  if (!category) {
    notFound()
  }

  const shortDesc = category.shortDescription

  // Fetch products in this category
  const products = await payload.find({
    collection: 'products',
    locale,
    where: {
      and: [
        { 'category.slug': { equals: slug } },
        { status: { equals: 'published' } },
      ],
    },
    limit,
    page: currentPage,
    sort: 'order',
    depth: 1,
  })

  // Fetch subcategories
  const subcategories = await payload.find({
    collection: 'product-categories',
    locale,
    where: {
      'parent.slug': { equals: slug },
    },
    sort: 'order',
    depth: 1,
  })

  return (
    <>
      {/* Hero Banner */}
      <section className="cat-hero">
        <Image
          src={CATEGORY_BANNER_URL}
          alt={category.title || ''}
          fill
          className="cat-hero__bg"
          priority
          sizes="100vw"
        />
        <div className="cat-hero__overlay" />
        <div className="cat-hero__content">
          <h1 className="cat-hero__title">{category.title}</h1>
          {shortDesc && <p className="cat-hero__desc">{shortDesc}</p>}
        </div>
      </section>

      {/* Description */}
      {category.description && (
        <section className="cat-description">
          <div className="container">
            <div className="prose prose-lg max-w-none">
              <RichText content={category.description} />
            </div>
          </div>
        </section>
      )}

      {/* Subcategories */}
      {subcategories.docs.length > 0 && (
        <section className="cat-subcategories">
          <div className="container">
            <h2 className="cat-subcategories__title">
              {locale === 'tr' ? 'Alt Kategoriler' : 'Subcategories'}
            </h2>
            <div className="cat-subcategories__grid">
              {subcategories.docs.map((subcat) => {
                const subcatImage = subcat.image as Media | undefined
                return (
                  <a
                    key={subcat.id}
                    href={`/${locale}/urun-kategori/${subcat.slug}`}
                    className="cat-subcard"
                  >
                    {subcatImage && (
                      <Image
                        src={subcatImage.url || ''}
                        alt={subcatImage.alt || subcat.title || ''}
                        fill
                        className="cat-subcard__img"
                      />
                    )}
                    <div className="cat-subcard__overlay" />
                    <span className="cat-subcard__name">{subcat.title}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="cat-products">
        <div className="container">
          <div className="cat-products__header">
            <h2 className="cat-products__title">
              {locale === 'tr' ? 'Tüm Ürünler' : 'All Products'}
            </h2>
            <span className="cat-products__count">
              {products.totalDocs} {locale === 'tr' ? 'ürün' : 'products'}
            </span>
          </div>

          {products.docs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.docs.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                  />
                ))}
              </div>

              {products.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from(
                    { length: products.totalPages },
                    (_, i) => i + 1
                  ).map((pageNum) => (
                    <a
                      key={pageNum}
                      href={`/${locale}/urun-kategori/${slug}?page=${pageNum}`}
                      className={`px-4 py-2 rounded ${
                        pageNum === currentPage
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {locale === 'tr'
                  ? 'Bu kategoride henüz ürün bulunmamaktadır.'
                  : 'No products found in this category.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
