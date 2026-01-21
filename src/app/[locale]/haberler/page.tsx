import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, getAlternateLinks } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { NewsCard } from '@/components/cards/NewsCard'

interface NewsPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const alternates = getAlternateLinks('news')

  return {
    title: dict.news.title,
    alternates: {
      languages: Object.fromEntries(alternates.map((a) => [a.locale, a.href])),
    },
  }
}

export default async function NewsPage({ params, searchParams }: NewsPageProps) {
  const { locale } = await params
  const { page = '1' } = await searchParams
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const currentPage = parseInt(page, 10)
  const limit = 12

  // Fetch news
  const news = await payload.find({
    collection: 'news',
    locale,
    where: {
      and: [
        { status: { equals: 'published' } },
        { publishedAt: { less_than_equal: new Date().toISOString() } },
      ],
    },
    limit,
    page: currentPage,
    sort: '-publishedAt',
    depth: 1,
  })

  return (
    <div className="section">
      <div className="container">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{dict.news.title}</h1>
          <p className="text-gray-600">
            {news.totalDocs} {dict.news.allNews.toLowerCase()}
          </p>
        </div>

        {/* News Grid */}
        {news.docs.length > 0 ? (
          <>
            <div className="grid-3">
              {news.docs.map((item) => (
                <NewsCard key={item.id} news={item} locale={locale} />
              ))}
            </div>

            {/* Pagination */}
            {news.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: news.totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <a
                      key={pageNum}
                      href={`/${locale}/haberler?page=${pageNum}`}
                      className={`px-4 py-2 rounded ${
                        pageNum === currentPage
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </a>
                  )
                )}
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
  )
}
