import Link from 'next/link'
import { type Locale, getTranslatedPath, getLocalePath } from '@/i18n/config'
import type { Project } from '@/payload-types'
import { ProjectCard } from '@/components/cards/ProjectCard'

interface FeaturedProjectsProps {
  projects: Project[]
  title?: string
  locale: Locale
  dict: Record<string, Record<string, string>>
}

export function FeaturedProjects({ projects, title, locale, dict }: FeaturedProjectsProps) {
  if (!projects || projects.length === 0) return null

  const projectsPath = getTranslatedPath('projects', locale)

  return (
    <section className="section">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-10">
          <div>
            <h2 className="section-title mb-2">{title || 'Referans Projelerimiz'}</h2>
            <p className="text-gray-600 max-w-lg">
              {locale === 'tr' 
                ? 'Türkiye ve dünya genelinde başarıyla tamamladığımız projeler'
                : 'Successfully completed projects in Turkey and worldwide'
              }
            </p>
          </div>
          <Link href={getLocalePath(locale, `/${projectsPath}`)} className="view-all whitespace-nowrap">
            {dict.common?.viewAll || 'Tümünü Gör'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  )
}
