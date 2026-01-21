import Link from 'next/link'
import { type Locale, getTranslatedPath, getLocalePath } from '@/i18n/config'
import type { News } from '@/payload-types'
import { NewsCard } from '@/components/cards/NewsCard'

interface LatestNewsProps {
  news: News[]
  title?: string
  locale: Locale
  dict: Record<string, Record<string, string>>
}

export function LatestNews({ news, title, locale, dict }: LatestNewsProps) {
  if (!news || news.length === 0) return null

  const newsPath = getTranslatedPath('news', locale)

  return (
    <section className="section bg-gray">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">{title || 'Son Haberler'}</h2>
          <p className="section-subtitle">
            {locale === 'tr' 
              ? 'Sektördeki gelişmeler ve şirket haberlerimiz'
              : 'Industry developments and company news'
            }
          </p>
        </div>

        {/* News Grid */}
        <div className="grid-4">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} locale={locale} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link 
            href={getLocalePath(locale, `/${newsPath}`)} 
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all"
          >
            {dict.common?.viewAll || 'Tüm Haberleri Gör'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
