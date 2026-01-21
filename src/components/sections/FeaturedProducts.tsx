import Link from 'next/link'
import { type Locale, getTranslatedPath, getLocalePath } from '@/i18n/config'
import type { Product } from '@/payload-types'
import { ProductCard } from '@/components/cards/ProductCard'

interface FeaturedProductsProps {
  products: Product[]
  title?: string
  locale: Locale
  dict: Record<string, Record<string, string>>
}

export function FeaturedProducts({ products, title, locale, dict }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null

  const productsPath = getTranslatedPath('products', locale)

  return (
    <section className="section bg-gray">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="section-title">{title || 'Öne Çıkan Ürünlerimiz'}</h2>
          </div>
          <Link href={getLocalePath(locale, `/${productsPath}`)} className="view-all">
            {dict.common?.viewAll || 'Tümünü Gör'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
