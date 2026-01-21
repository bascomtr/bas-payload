import Link from 'next/link'
import Image from 'next/image'
import { type Locale, getTranslatedPath, getLocalePath } from '@/i18n/config'
import type { Product, Media, ProductCategory } from '@/payload-types'

interface ProductCardProps {
  product: Product
  locale: Locale
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const featuredImage = product.featuredImage as Media | undefined
  const category = product.category as ProductCategory | undefined
  const href = getLocalePath(locale, `/${getTranslatedPath('products', locale)}/${product.slug}`)

  return (
    <Link href={href} className="card group">
      {/* Image */}
      <div className="card-image">
        {featuredImage?.url ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || product.title || ''}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        {category && (
          <span className="card-badge">{category.title}</span>
        )}
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="flex items-center gap-2 text-white font-semibold text-sm">
            Detayları Gör
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="card-title">{product.title}</h3>
        {product.shortDescription && (
          <p className="card-description">{product.shortDescription}</p>
        )}
      </div>
    </Link>
  )
}
