import Link from 'next/link'
import Image from 'next/image'
import { type Locale, locales, localeNames, defaultLocale, getTranslatedPath, getLocalePath } from '@/i18n/config'
import type { Navigation, SiteSetting, Media } from '@/payload-types'

interface HeaderProps {
  locale: Locale
  navigation: Navigation
  siteSettings: SiteSetting
  dict: Record<string, Record<string, string>>
}

export function Header({ locale, navigation, siteSettings, dict }: HeaderProps) {
  return (
    <header className="header">
      {/* Top Bar */}
      {navigation?.showTopBar && (
        <div className="topbar">
          <div className="container flex justify-between items-center">
            <div className="flex items-center gap-6">
              {siteSettings?.phone && (
                <a href={`tel:${siteSettings.phone}`} className="topbar-link">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {siteSettings.phone}
                </a>
              )}
              {siteSettings?.email && (
                <a href={`mailto:${siteSettings.email}`} className="topbar-link">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {siteSettings.email}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Social Links */}
              {siteSettings?.social && (
                <div className="hidden md:flex items-center gap-3">
                  {siteSettings.social.linkedin && (
                    <a href={siteSettings.social.linkedin} target="_blank" rel="noopener noreferrer" className="topbar-social">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                  {siteSettings.social.youtube && (
                    <a href={siteSettings.social.youtube} target="_blank" rel="noopener noreferrer" className="topbar-social">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                </div>
              )}
              {/* Language Switcher */}
              <div className="relative group">
                <button className="lang-switcher">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {localeNames[locale]}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="lang-dropdown">
                  {locales.map((loc) => (
                    <Link
                      key={loc}
                      href={getLocalePath(loc)}
                      className={`lang-option ${loc === locale ? 'active' : ''}`}
                    >
                      {localeNames[loc]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="main-header">
        <div className="container flex items-center justify-between">
          {/* Logo - Always use SVG from public folder */}
          <Link href={getLocalePath(locale)} className="logo">
            <Image
              src="/bas_logo.svg"
              alt={siteSettings?.siteName || 'BAS Endüstriyel'}
              width={170}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="main-nav">
            {navigation?.mainMenu?.map((item, index) => {
              const href = item.type === 'internal' && item.internalLink
                ? getInternalLink(item.internalLink, locale)
                : item.externalLink || '#'

              const hasChildren = item.children && item.children.length > 0

              return (
                <div key={index} className="nav-item group">
                  <Link
                    href={href}
                    className="nav-link"
                    target={item.openInNewTab ? '_blank' : undefined}
                  >
                    {item.label}
                    {hasChildren && (
                      <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown */}
                  {hasChildren && (
                    <div className="nav-dropdown">
                      {item.children?.map((child, childIndex) => {
                        const childHref = child.type === 'internal' && child.internalLink
                          ? getInternalLink(child.internalLink, locale)
                          : child.externalLink || '#'

                        return (
                          <Link
                            key={childIndex}
                            href={childHref}
                            className="nav-dropdown-item"
                            target={child.openInNewTab ? '_blank' : undefined}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* CTA Button */}
          <Link href={getLocalePath(locale, '/iletisim')} className="header-cta">
            {dict.contact?.title || 'İletişim'}
          </Link>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" aria-label={dict.navigation?.menu || 'Menü'}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

function getInternalLink(
  link: { relationTo: string; value: unknown } | null,
  locale: Locale
): string {
  if (!link) return '#'

  const value = link.value as { slug?: string } | number | null
  if (!value) return '#'

  const slug = typeof value === 'object' ? value.slug : ''

  switch (link.relationTo) {
    case 'pages':
      return getLocalePath(locale, `/${slug}`)
    case 'products':
      return getLocalePath(locale, `/${getTranslatedPath('products', locale)}/${slug}`)
    case 'product-categories':
      return getLocalePath(locale, `/${getTranslatedPath('products', locale)}?category=${slug}`)
    case 'projects':
      return getLocalePath(locale, `/${getTranslatedPath('projects', locale)}/${slug}`)
    case 'project-categories':
      return getLocalePath(locale, `/${getTranslatedPath('projects', locale)}?category=${slug}`)
    case 'news':
      return getLocalePath(locale, `/${getTranslatedPath('news', locale)}/${slug}`)
    default:
      return '#'
  }
}
