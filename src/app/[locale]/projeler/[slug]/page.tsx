import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, locales, getTranslatedPath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { RichText } from '@/components/ui/RichText'
import type { Media } from '@/payload-types'

interface ProjectPageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

// Dynamic rendering - skip static generation at build time
export const dynamic = 'force-dynamic'

export function generateStaticParams(): Array<{ locale: Locale; slug: string }> {
  return []
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const projects = await payload.find({
    collection: 'projects',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const project = projects.docs[0]

  if (!project) {
    return { title: 'Not Found' }
  }

  const meta = project.meta as { title?: string; description?: string; image?: Media } | undefined

  return {
    title: meta?.title || project.title,
    description: meta?.description || project.excerpt,
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc,
          `/${loc}/${getTranslatedPath('projects', loc)}/${slug}`,
        ])
      ),
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const projects = await payload.find({
    collection: 'projects',
    locale,
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  const project = projects.docs[0]

  if (!project) {
    notFound()
  }

  const featuredImage = project.featuredImage as Media | undefined

  return (
    <article>
      {/* Hero Section */}
      {featuredImage && (
        <div className="relative h-[400px] lg:h-[500px]">
          <Image
            src={featuredImage.url || ''}
            alt={featuredImage.alt || project.title || ''}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {project.title}
              </h1>
              {project.excerpt && (
                <p className="text-lg text-white/90 max-w-2xl">
                  {project.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <div className="container">
          <div className="grid-2 gap-12">
            {/* Project Details */}
            <div>
              {project.description && (
                <div className="rich-text">
                  <RichText content={project.description} />
                </div>
              )}

              {/* Highlights */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Öne Çıkanlar</h2>
                  <ul className="space-y-2">
                    {project.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        <span>{highlight.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Project Info Sidebar */}
            <div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Proje Bilgileri</h2>
                <dl className="space-y-4">
                  {project.client && (
                    <div>
                      <dt className="text-sm text-gray-500">
                        {dict.projects.client}
                      </dt>
                      <dd className="font-medium">{project.client}</dd>
                    </div>
                  )}
                  {project.location && (
                    <div>
                      <dt className="text-sm text-gray-500">
                        {dict.projects.location}
                      </dt>
                      <dd className="font-medium">{project.location}</dd>
                    </div>
                  )}
                  {project.completionDate && (
                    <div>
                      <dt className="text-sm text-gray-500">
                        {dict.projects.completionDate}
                      </dt>
                      <dd className="font-medium">
                        {new Date(project.completionDate).toLocaleDateString(
                          locale
                        )}
                      </dd>
                    </div>
                  )}
                  {project.projectType && (
                    <div>
                      <dt className="text-sm text-gray-500">
                        {dict.projects.projectType}
                      </dt>
                      <dd className="font-medium">{project.projectType}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Galeri</h2>
              <div className="grid-3">
                {project.gallery.map((item, index) => {
                  const image = item.image as Media
                  return (
                    <div
                      key={index}
                      className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={image?.url || ''}
                        alt={item.caption || ''}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
