import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { locales, defaultLocale, type Locale, localeNames, getLocalePath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import '@/app/[locale]/globals.css'

// Force dynamic rendering to avoid D1 issues during build
export const dynamic = 'force-dynamic'

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
  })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bas.com.tr'

  return {
    title: {
      default: siteSettings?.defaultMetaTitle || 'BAS Endüstriyel',
      template: `%s | ${siteSettings?.siteName || 'BAS Endüstriyel'}`,
    },
    description: siteSettings?.defaultMetaDescription,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: getLocalePath(locale),
      languages: Object.fromEntries(
        locales.map((loc) => [loc, getLocalePath(loc)])
      ),
    },
    openGraph: {
      siteName: siteSettings?.siteName || 'BAS Endüstriyel',
      locale: locale,
      type: 'website',
    },
  }
}

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: Locale }>
}

export default async function LocaleLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale)) {
    notFound()
  }

  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch navigation and settings
  const [navigation, siteSettings] = await Promise.all([
    payload.findGlobal({ slug: 'navigation', locale }),
    payload.findGlobal({ slug: 'site-settings', locale }),
  ])

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* hreflang tags for SEO */}
        {locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={getLocalePath(loc)}
          />
        ))}
        <link rel="alternate" hrefLang="x-default" href="/" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header
          locale={locale}
          navigation={navigation}
          siteSettings={siteSettings}
          dict={dict}
        />
        <main className="flex-grow">{children}</main>
        <Footer
          locale={locale}
          navigation={navigation}
          siteSettings={siteSettings}
          dict={dict}
        />
      </body>
    </html>
  )
}
