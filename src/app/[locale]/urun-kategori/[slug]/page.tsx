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

  const image = category.image as Media | undefined

  return {
    title: category.title,
    description:
      typeof category.description === 'object'
        ? undefined
        : category.description,
    openGraph: {
      title: category.title || undefined,
      images: image ? [{ url: image.url || '' }] : undefined,
    },
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

  const categoryImage = category.image as Media | undefined

  return (
    <div className="section">
      <div className="container">
        {/* Category Header */}
        <div className="mb-12">
          {categoryImage && (
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
              <Image
                src={categoryImage.url || ''}
                alt={categoryImage.alt || category.title || ''}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {category.title}
                </h1>
              </div>
            </div>
          )}

          {!categoryImage && (
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {category.title}
            </h1>
          )}

          {category.description && (
            <div className="prose prose-lg max-w-none text-gray-600">
              <RichText content={category.description} />
            </div>
          )}
        </div>

        {/* Subcategories */}
        {subcategories.docs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">
              {locale === 'tr' ? 'Alt Kategoriler' : 'Subcategories'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subcategories.docs.map((subcat) => {
                const subcatImage = subcat.image as Media | undefined
                return (
                  <a
                    key={subcat.id}
                    href={`/${locale}/urun-kategori/${subcat.slug}`}
                    className="group relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                  >
                    {subcatImage && (
                      <Image
                        src={subcatImage.url || ''}
                        alt={subcatImage.alt || subcat.title || ''}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-semibold text-center px-2">
                        {subcat.title}
                      </span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {dict.products?.allProducts || 'Ürünler'}
            </h2>
            <span className="text-gray-500">
              {products.totalDocs}{' '}
              {locale === 'tr' ? 'ürün' : 'products'}
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

              {/* Pagination */}
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
      </div>
    </div>
  )
}
