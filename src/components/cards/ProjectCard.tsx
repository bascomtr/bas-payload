import Link from 'next/link'
import Image from 'next/image'
import { type Locale, getTranslatedPath, getLocalePath } from '@/i18n/config'
import type { Project, Media, ProjectCategory } from '@/payload-types'

interface ProjectCardProps {
  project: Project
  locale: Locale
}

export function ProjectCard({ project, locale }: ProjectCardProps) {
  const featuredImage = project.featuredImage as Media | undefined
  const category = project.category as ProjectCategory | undefined
  const href = getLocalePath(locale, `/${getTranslatedPath('projects', locale)}/${project.slug}`)

  return (
    <Link href={href} className="block relative rounded-xl overflow-hidden shadow-md group">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {featuredImage?.url ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt || project.title || ''}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-linear-to-t from-secondary/95 via-secondary/70 to-transparent group-hover:from-primary/95 group-hover:via-primary/70 flex items-end transition-all duration-300"
          style={{ padding: '1.5rem' }}
        >
          <div className="text-white w-full">
            {category && (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider opacity-80" style={{ marginBottom: '0.5rem' }}>
                {category.title}
              </span>
            )}
            <h3 className="text-xl font-bold" style={{ marginBottom: '0.5rem' }}>{project.title}</h3>
            {project.location && (
              <p className="flex items-center text-sm opacity-90" style={{ gap: '0.375rem', marginBottom: '1rem' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {project.location}
              </p>
            )}
            <span className="inline-flex items-center text-sm font-semibold opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" style={{ gap: '0.5rem' }}>
              Projeyi İncele
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
