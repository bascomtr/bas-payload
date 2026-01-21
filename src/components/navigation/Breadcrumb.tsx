import Link from 'next/link'
import { type Locale } from '@/i18n/config'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  locale: Locale
}

export function Breadcrumb({ items, locale }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            href={`/${locale}`}
            className="text-gray-500 hover:text-primary transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="sr-only">
              {locale === 'tr' ? 'Ana Sayfa' : 'Home'}
            </span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              <svg
                className="w-4 h-4 text-gray-400 mx-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>

              {/* Breadcrumb item */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`${
                    isLast
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Structured data for SEO
export function BreadcrumbJsonLd({
  items,
  locale,
  baseUrl = 'https://bas.com.tr',
}: BreadcrumbProps & { baseUrl?: string }) {
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: locale === 'tr' ? 'Ana Sayfa' : 'Home',
      item: `${baseUrl}/${locale}`,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.label,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
