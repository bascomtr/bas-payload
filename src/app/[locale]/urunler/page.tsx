import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, getAlternateLinks } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { ProductCard } from '@/components/cards/ProductCard'
import { CategorySidebar } from '@/components/navigation/CategorySidebar'

interface ProductsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ category?: string; page?: string }>
}

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const alternates = getAlternateLinks('products')

  return {
    title: dict.products.title,
    alternates: {
      languages: Object.fromEntries(alternates.map((a) => [a.locale, a.href])),
    },
  }
}

export default async function ProductsPage({ params, searchParams }: ProductsPageProps) {
  const { locale } = await params
  const { category, page = '1' } = await searchParams
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const currentPage = parseInt(page, 10)
  const limit = 12

  // Build query
  const where: Record<string, unknown> = {
    status: { equals: 'published' },
  }

  if (category) {
    where['category.slug'] = { equals: category }
  }

  // Fetch products
  const products = await payload.find({
    collection: 'products',
    locale,
    where,
    limit,
    page: currentPage,
    sort: 'order',
    depth: 1,
  })

  // Fetch categories for sidebar
  const categories = await payload.find({
    collection: 'product-categories',
    locale,
    sort: 'order',
    depth: 1,
    limit: 100,
  })

  return (
    <div className="section">
      <div className="container">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{dict.products.title}</h1>
          <p className="text-gray-600">
            {products.totalDocs} {dict.products.allProducts.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <CategorySidebar
              categories={categories.docs}
              currentSlug={category}
              basePath={`/${locale}/urunler`}
              title={dict.products.categories}
              allLabel={dict.products.allProducts}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-grow">
            {products.docs.length > 0 ? (
              <>
                <div className="grid-3">
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
                    {Array.from({ length: products.totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <a
                          key={pageNum}
                          href={`/${locale}/urunler?page=${pageNum}${category ? `&category=${category}` : ''}`}
                          className={`px-4 py-2 rounded ${
                            pageNum === currentPage
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </a>
                      )
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{dict.common.notFound}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
