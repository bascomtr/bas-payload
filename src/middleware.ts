import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, type Locale } from './i18n/config'

// Non-default locales (those that need URL prefix)
const nonDefaultLocales = locales.filter((l) => l !== defaultLocale)

function getLocaleFromHeader(request: NextRequest): Locale {
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().substring(0, 2))
      .find((lang) => locales.includes(lang as Locale))
    if (preferredLocale) return preferredLocale as Locale
  }
  return defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for these paths
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // files like favicon.ico
  ) {
    return NextResponse.next()
  }

  // Check if pathname starts with a non-default locale (en, es, ru)
  const pathnameHasNonDefaultLocale = nonDefaultLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasNonDefaultLocale) {
    // Non-default locale in URL, proceed normally
    return NextResponse.next()
  }

  // Check if pathname starts with default locale (tr)
  // If so, redirect to remove the prefix
  if (pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`) {
    const newPathname = pathname.replace(`/${defaultLocale}`, '') || '/'
    return NextResponse.redirect(new URL(newPathname, request.url))
  }

  // No locale in URL - this is Turkish (default) content
  // Rewrite internally to /tr/... but keep URL without /tr
  const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url)
  return NextResponse.rewrite(newUrl)
}

export const config = {
  matcher: [
    // Skip internal paths
    '/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
