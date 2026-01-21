import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { locales, type Locale, getTranslatedPath } from '@/i18n/config'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bas.com.tr'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const entries: MetadataRoute.Sitemap = []

  // Add homepage for each locale
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          locales.map((loc) => [loc, `${baseUrl}/${loc}`])
        ),
      },
    })
  }

  // Add static pages
  const staticPages = ['products', 'projects', 'news', 'about', 'contact']
  for (const page of staticPages) {
    for (const locale of locales) {
      const translatedPath = getTranslatedPath(page, locale)
      entries.push({
        url: `${baseUrl}/${locale}/${translatedPath}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}/${getTranslatedPath(page, loc)}`,
            ])
          ),
        },
      })
    }
  }

  // Add products
  for (const locale of locales) {
    const products = await payload.find({
      collection: 'products',
      locale,
      where: { status: { equals: 'published' } },
      limit: 1000,
    })

    for (const product of products.docs) {
      if (!product.slug) continue

      entries.push({
        url: `${baseUrl}/${locale}/${getTranslatedPath('products', locale)}/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}/${getTranslatedPath('products', loc)}/${product.slug}`,
            ])
          ),
        },
      })
    }
  }

  // Add projects
  for (const locale of locales) {
    const projects = await payload.find({
      collection: 'projects',
      locale,
      where: { status: { equals: 'published' } },
      limit: 1000,
    })

    for (const project of projects.docs) {
      if (!project.slug) continue

      entries.push({
        url: `${baseUrl}/${locale}/${getTranslatedPath('projects', locale)}/${project.slug}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}/${getTranslatedPath('projects', loc)}/${project.slug}`,
            ])
          ),
        },
      })
    }
  }

  // Add news
  for (const locale of locales) {
    const news = await payload.find({
      collection: 'news',
      locale,
      where: { status: { equals: 'published' } },
      limit: 1000,
    })

    for (const item of news.docs) {
      if (!item.slug) continue

      entries.push({
        url: `${baseUrl}/${locale}/${getTranslatedPath('news', locale)}/${item.slug}`,
        lastModified: new Date(item.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.5,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              `${baseUrl}/${loc}/${getTranslatedPath('news', loc)}/${item.slug}`,
            ])
          ),
        },
      })
    }
  }

  // Add pages
  for (const locale of locales) {
    const pages = await payload.find({
      collection: 'pages',
      locale,
      where: { status: { equals: 'published' } },
      limit: 1000,
    })

    for (const page of pages.docs) {
      if (!page.slug) continue

      entries.push({
        url: `${baseUrl}/${locale}/${page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, `${baseUrl}/${loc}/${page.slug}`])
          ),
        },
      })
    }
  }

  return entries
}
