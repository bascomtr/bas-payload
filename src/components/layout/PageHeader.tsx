import Link from 'next/link'
import { type Locale, getLocalePath } from '@/i18n/config'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  locale: Locale
}

export function PageHeader({ title, subtitle, breadcrumbs, locale }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="container">
        <div className="relative z-10 text-center text-white py-16 md:py-20">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center justify-center gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <Link href={getLocalePath(locale)} className="text-white/80 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="sr-only">Ana Sayfa</span>
                  </Link>
                </li>
                {breadcrumbs.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.href ? (
                      <Link href={item.href} className="text-white/80 hover:text-white transition-colors">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-white font-medium">{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{title}</h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg text-white/90 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
      </div>
    </section>
  )
}
