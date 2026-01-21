import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, locales, getTranslatedPath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { RichText } from '@/components/ui/RichText'
import type { Media, User } from '@/payload-types'

interface NewsDetailPageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

// Dynamic rendering - skip static generation at build time
export const dynamic = 'force-dynamic'

export function generateStaticParams(): Array<{ locale: Locale; slug: string }> {
  return []
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const news = await payload.find({
    collection: 'news',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const item = news.docs[0]

  if (!item) {
    return { title: 'Not Found' }
  }

  const meta = item.meta as { title?: string; description?: string; image?: Media } | undefined
  const featuredImage = item.featuredImage as Media | undefined

  return {
    title: meta?.title || item.title,
    description: meta?.description || item.excerpt,
    openGraph: {
      title: meta?.title || item.title,
      description: meta?.description || item.excerpt || undefined,
      type: 'article',
      publishedTime: item.publishedAt,
      images: meta?.image
        ? [{ url: (meta.image as Media).url || '' }]
        : featuredImage
          ? [{ url: featuredImage.url || '' }]
          : undefined,
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc,
          `/${loc}/${getTranslatedPath('news', loc)}/${slug}`,
        ])
      ),
    },
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { locale, slug } = await params
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const news = await payload.find({
    collection: 'news',
    locale,
    where: {
      and: [
        { slug: { equals: slug } },
        { status: { equals: 'published' } },
        { publishedAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    depth: 2,
    limit: 1,
  })

  const item = news.docs[0]

  if (!item) {
    notFound()
  }

  const featuredImage = item.featuredImage as Media | undefined
  const author = item.author as User | undefined

  return (
    <article className="section">
      <div className="container max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">{item.title}</h1>

          <div className="flex items-center gap-4 text-gray-600">
            {item.publishedAt && (
              <time dateTime={item.publishedAt}>
                {new Date(item.publishedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {author && (
              <>
                <span>•</span>
                <span>{author.name || author.email}</span>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {featuredImage && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
            <Image
              src={featuredImage.url || ''}
              alt={featuredImage.alt || item.title || ''}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt */}
        {item.excerpt && (
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {item.excerpt}
          </p>
        )}

        {/* Content */}
        {item.content && (
          <div className="rich-text">
            <RichText content={item.content} />
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8">
          <a
            href={`/${locale}/haberler`}
            className="text-primary hover:underline"
          >
            ← {dict.news.allNews}
          </a>
        </div>
      </div>
    </article>
  )
}
