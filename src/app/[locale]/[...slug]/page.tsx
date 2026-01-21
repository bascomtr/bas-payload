import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
// import { RichText } from '@/components/ui/RichText'
import type { Media, Page } from '@/payload-types'

interface PageProps {
  params: Promise<{ locale: Locale; slug: string[] }>
}

// Dynamic rendering - skip static generation at build time
// Pages will be rendered on demand at runtime
export const dynamic = 'force-dynamic'

export function generateStaticParams(): Array<{ locale: Locale; slug: string[] }> {
  // Return empty array to avoid database queries at build time
  // Pages will be generated on-demand
  return []
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Join slug array to get the full path
  const pageSlug = slug[slug.length - 1] // Use last segment for lookup

  const pages = await payload.find({
    collection: 'pages',
    locale,
    where: { slug: { equals: pageSlug } },
    limit: 1,
    depth: 1,
  })

  const page = pages.docs[0]

  if (!page) {
    return { title: 'Not Found' }
  }

  const meta = page.meta as {
    title?: string
    description?: string
    image?: Media
  } | null

  const heroImage = page.heroImage as Media | undefined

  return {
    title: meta?.title || page.title,
    description: meta?.description || undefined,
    openGraph: {
      title: meta?.title || page.title || undefined,
      description: meta?.description || undefined,
      images: meta?.image
        ? [{ url: (meta.image as Media).url || '' }]
        : heroImage
          ? [{ url: heroImage.url || '' }]
          : undefined,
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `/${loc}/${slug.join('/')}`])
      ),
    },
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { locale, slug } = await params
  const _dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Use last segment for lookup
  const pageSlug = slug[slug.length - 1]

  const pages = await payload.find({
    collection: 'pages',
    locale,
    where: {
      and: [{ slug: { equals: pageSlug } }, { status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  const page = pages.docs[0] as Page | undefined

  if (!page) {
    notFound()
  }

  const heroImage = page.heroImage as Media | undefined
  const heroType = page.heroType || 'simple'

  return (
    <article>
      {/* Hero Section */}
      {heroType !== 'none' && (
        <section
          className={`relative ${
            heroType === 'fullWidth'
              ? 'min-h-[400px] md:min-h-[500px]'
              : heroType === 'withImage'
                ? 'min-h-[300px] md:min-h-[400px]'
                : 'py-16 md:py-24 bg-gray-50'
          }`}
        >
          {/* Background Image for withImage and fullWidth */}
          {(heroType === 'withImage' || heroType === 'fullWidth') &&
            heroImage && (
              <>
                <Image
                  src={heroImage.url || ''}
                  alt={heroImage.alt || page.title || ''}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/50" />
              </>
            )}

          {/* Content */}
          <div
            className={`container relative z-10 ${
              heroType === 'fullWidth' || heroType === 'withImage'
                ? 'h-full flex flex-col justify-center min-h-[inherit] text-white'
                : ''
            }`}
          >
            <h1
              className={`text-3xl md:text-4xl lg:text-5xl font-bold ${
                heroType === 'simple' ? 'text-gray-900' : ''
              }`}
            >
              {page.title}
            </h1>

            {page.heroSubtitle && (
              <p
                className={`mt-4 text-lg md:text-xl max-w-3xl ${
                  heroType === 'simple' ? 'text-gray-600' : 'text-white/90'
                }`}
              >
                {page.heroSubtitle}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Simple title for 'none' hero type */}
      {heroType === 'none' && (
        <div className="container pt-12">
          <h1 className="text-3xl md:text-4xl font-bold">{page.title}</h1>
        </div>
      )}

      {/* Content Blocks */}
      {page.content && Array.isArray(page.content) && page.content.length > 0 && (
        <RenderBlocks blocks={page.content} locale={locale} />
      )}

      {/* If no content blocks, show empty state */}
      {(!page.content || !Array.isArray(page.content) || page.content.length === 0) && (
        <div className="section">
          <div className="container">
            <div className="prose prose-lg max-w-none">
              {/* Page content would go here if using richText instead of blocks */}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
