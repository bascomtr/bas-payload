export const locales = ['tr', 'en', 'es', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'tr'

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  es: 'Español',
  ru: 'Русский',
}

// URL path mapping for SEO-friendly routes
export const routeTranslations: Record<
  string,
  Record<Locale, string>
> = {
  products: {
    tr: 'urunler',
    en: 'products',
    es: 'productos',
    ru: 'produkty',
  },
  projects: {
    tr: 'projeler',
    en: 'projects',
    es: 'proyectos',
    ru: 'proekty',
  },
  news: {
    tr: 'haberler',
    en: 'news',
    es: 'noticias',
    ru: 'novosti',
  },
  about: {
    tr: 'hakkimizda',
    en: 'about',
    es: 'nosotros',
    ru: 'o-nas',
  },
  contact: {
    tr: 'iletisim',
    en: 'contact',
    es: 'contacto',
    ru: 'kontakty',
  },
  services: {
    tr: 'hizmetler',
    en: 'services',
    es: 'servicios',
    ru: 'uslugi',
  },
  team: {
    tr: 'ekip',
    en: 'team',
    es: 'equipo',
    ru: 'komanda',
  },
}

// Get the route key from a translated path
export function getRouteKey(path: string, locale: Locale): string | undefined {
  for (const [key, translations] of Object.entries(routeTranslations)) {
    if (translations[locale] === path) {
      return key
    }
  }
  return undefined
}

// Get the translated path from a route key
export function getTranslatedPath(routeKey: string, locale: Locale): string {
  return routeTranslations[routeKey]?.[locale] || routeKey
}

// Generate alternate links for SEO
export function getAlternateLinks(
  routeKey: string,
  slug?: string
): Array<{ locale: Locale; href: string }> {
  return locales.map((locale) => {
    const basePath = getTranslatedPath(routeKey, locale)
    // Default locale (tr) doesn't have prefix in URL
    const prefix = locale === defaultLocale ? '' : `/${locale}`
    const href = slug ? `${prefix}/${basePath}/${slug}` : `${prefix}/${basePath}`
    return { locale, href }
  })
}

// Helper to generate locale-aware URL path
export function getLocalePath(locale: Locale, path: string = ''): string {
  // Default locale (tr) doesn't have prefix in URL
  if (locale === defaultLocale) {
    return path.startsWith('/') ? path : `/${path}`
  }
  return path ? `/${locale}${path.startsWith('/') ? path : `/${path}`}` : `/${locale}`
}
