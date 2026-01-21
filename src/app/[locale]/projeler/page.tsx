import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, getAlternateLinks } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { CategorySidebar } from '@/components/navigation/CategorySidebar'

interface ProjectsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ category?: string; page?: string }>
}

export async function generateMetadata({
  params,
}: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const alternates = getAlternateLinks('projects')

  return {
    title: dict.projects.title,
    alternates: {
      languages: Object.fromEntries(alternates.map((a) => [a.locale, a.href])),
    },
  }
}

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const { locale } = await params
  const { category, page = '1' } = await searchParams
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const currentPage = parseInt(page, 10)
  const limit = 9

  // Build query
  const where: Record<string, unknown> = {
    status: { equals: 'published' },
  }

  if (category) {
    where['category.slug'] = { equals: category }
  }

  // Fetch projects
  const projects = await payload.find({
    collection: 'projects',
    locale,
    where,
    limit,
    page: currentPage,
    sort: '-completionDate',
    depth: 1,
  })

  // Fetch categories for sidebar
  const categories = await payload.find({
    collection: 'project-categories',
    locale,
    sort: 'order',
    depth: 0,
    limit: 100,
  })

  return (
    <div className="section">
      <div className="container">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{dict.projects.title}</h1>
          <p className="text-gray-600">
            {projects.totalDocs} {dict.projects.allProjects.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <CategorySidebar
              categories={categories.docs}
              currentSlug={category}
              basePath={`/${locale}/projeler`}
              title={dict.projects.categories}
              allLabel={dict.projects.allProjects}
            />
          </aside>

          {/* Projects Grid */}
          <div className="flex-grow">
            {projects.docs.length > 0 ? (
              <>
                <div className="grid-3">
                  {projects.docs.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      locale={locale}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {projects.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from(
                      { length: projects.totalPages },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <a
                        key={pageNum}
                        href={`/${locale}/projeler?page=${pageNum}${category ? `&category=${category}` : ''}`}
                        className={`px-4 py-2 rounded ${
                          pageNum === currentPage
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">{dict.common.notFound}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
