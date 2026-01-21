import Link from 'next/link'
import Image from 'next/image'
import { type Locale, getTranslatedPath, getLocalePath } from '@/i18n/config'
import type { News, Media } from '@/payload-types'

interface NewsCardProps {
  news: News
  locale: Locale
}

function formatDate(dateString: string, locale: Locale): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function NewsCard({ news, locale }: NewsCardProps) {
  const featuredImage = news.featuredImage as Media | undefined
  const href = getLocalePath(locale, `/${getTranslatedPath('news', locale)}/${news.slug}`)

  return (
    <Link href={href} className="card group">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {featuredImage?.url ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || news.title || ''}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-content flex flex-col flex-grow">
        {news.publishedAt && (
          <time 
            className="text-xs text-primary font-semibold uppercase tracking-wide mb-2" 
            dateTime={news.publishedAt}
          >
            {formatDate(news.publishedAt, locale)}
          </time>
        )}
        <h3 className="card-title line-clamp-2">{news.title}</h3>
        {news.excerpt && (
          <p className="card-description flex-grow">{news.excerpt}</p>
        )}
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary mt-auto pt-4 group-hover:gap-3 transition-all">
          Devamını Oku
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
