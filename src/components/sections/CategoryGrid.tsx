import Image from 'next/image'
import Link from 'next/link'
import { type Locale, getLocalePath } from '@/i18n/config'
import type { ProductCategory, Media } from '@/payload-types'

interface CategoryGridProps {
  categories: ProductCategory[]
  locale: Locale
  title?: string
}

export function CategoryGrid({ categories, locale, title }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null

  return (
    <section className="equip-section">
      <div className="container">
        {title && <h2 className="equip-section__title">{title}</h2>}
        <div className="equip-grid">
          {categories.map((category) => {
            const image = category.image as Media | undefined
            const desc = category.shortDescription

            return (
              <Link
                key={category.id}
                href={getLocalePath(locale, `/urun-kategori/${category.slug}`)}
                className="equip-card"
              >
                {/* Image area */}
                <div className="equip-card__visual">
                  {image?.url ? (
                    <Image
                      src={image.url}
                      alt={image.alt || category.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="equip-card__img"
                    />
                  ) : (
                    <div className="equip-card__placeholder" />
                  )}
                </div>

                {/* Info bar — always visible title + hover description */}
                <div className="equip-card__info">
                  <h3 className="equip-card__name">{category.title}</h3>
                  {desc && <p className="equip-card__desc">{desc}</p>}
                  <span className="equip-card__link">
                    Detaylı Bilgi
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
