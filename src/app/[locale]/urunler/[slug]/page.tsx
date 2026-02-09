import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, locales, getTranslatedPath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { RichText } from '@/components/ui/RichText'
import { ProductCard } from '@/components/cards/ProductCard'
import { ProductGallery } from '@/components/ui/ProductGallery'
import { YouTubeVideo } from '@/components/ui/YouTubeVideo'
import { getMediaUrl } from '@/lib/media'
import type { Product, Media } from '@/payload-types'

interface ProductPageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

// Dynamic rendering - skip static generation at build time
export const dynamic = 'force-dynamic'

export function generateStaticParams(): Array<{ locale: Locale; slug: string }> {
  return []
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const products = await payload.find({
    collection: 'products',
    locale,
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const product = products.docs[0]

  if (!product) {
    return { title: 'Not Found' }
  }

  const meta = product.meta as { title?: string; description?: string; image?: Media } | undefined

  return {
    title: meta?.title || product.title,
    description: meta?.description || product.shortDescription,
    openGraph: {
      title: meta?.title || product.title,
      description: meta?.description || product.shortDescription || undefined,
      images: meta?.image
        ? [{ url: (meta.image as Media).url || '' }]
        : product.featuredImage
          ? [{ url: (product.featuredImage as Media).url || '' }]
          : undefined,
    },
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc,
          `/${loc}/${getTranslatedPath('products', loc)}/${slug}`,
        ])
      ),
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const products = await payload.find({
    collection: 'products',
    locale,
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  const product = products.docs[0]

  if (!product) {
    notFound()
  }

  // Fetch related products
  const relatedProducts = product.relatedProducts
    ? await payload.find({
        collection: 'products',
        locale,
        where: {
          id: {
            in: (product.relatedProducts as Product[]).map((p) =>
              typeof p === 'object' ? p.id : p
            ),
          },
        },
        depth: 1,
      })
    : null

  // Build gallery images array: featured image first, then gallery items
  const galleryImages: Array<{ url: string; alt: string }> = []

  const featuredImage = product.featuredImage as Media | undefined
  const featuredImageUrl = getMediaUrl(featuredImage)
  if (featuredImageUrl) {
    galleryImages.push({
      url: featuredImageUrl,
      alt: featuredImage?.alt || product.title || '',
    })
  }

  if (product.gallery) {
    for (const item of product.gallery) {
      const image = item.image as Media
      const imageUrl = getMediaUrl(image)
      if (imageUrl) {
        galleryImages.push({
          url: imageUrl,
          alt: item.caption || image?.alt || '',
        })
      }
    }
  }

  // Get category info for breadcrumb and header
  const category = product.category as { title?: string; slug?: string } | undefined

  return (
    <article>
      {/* Page Header - Category Name + Breadcrumb */}
      <div className="product-page-header">
        <div className="container">
          <h1 className="product-page-header-title">
            {category?.title || dict.products.title}
          </h1>
          <nav className="breadcrumb">
            <a href={`/${locale}`}>BAS&reg;</a>
            <span className="breadcrumb-separator">&gt;</span>
            <a href={`/${locale}/urunler`}>{category?.title || dict.products.title}</a>
            <span className="breadcrumb-separator">&gt;</span>
            <span>{product.title}</span>
          </nav>
        </div>
      </div>

      {/* Product Content: Image Left + Info Right */}
      <div className="section">
        <div className="container">
          <div className="pd-layout">
            {/* Left Column: Featured Image + Gallery Grid */}
            <div className="pd-gallery-col">
              <ProductGallery
                images={galleryImages}
                productTitle={product.title || ''}
              />
            </div>

            {/* Right Column: Title + Description */}
            <div className="pd-info-col">
              <h2 className="pd-title">{product.title}</h2>

              {product.shortDescription && (
                <p className="pd-short-desc">{product.shortDescription}</p>
              )}

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="pd-specs">
                  <h3 className="pd-specs-heading">
                    {dict.products.specifications}
                  </h3>
                  <table className="pd-specs-table">
                    <tbody>
                      {product.specifications.map((spec, index) => (
                        <tr key={index}>
                          <td className="pd-specs-label">{spec.label}</td>
                          <td className="pd-specs-value">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* CTA */}
              <div className="pd-cta">
                <a
                  href={`/${locale}/iletisim?product=${product.slug}`}
                  className="btn btn-primary"
                >
                  {dict.products.requestQuote}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Tab Section */}
      {(product.description || (product.videos && product.videos.length > 0)) && (
        <div className="pd-description-section">
          <div className="container">
            <div className="pd-tab-bar">
              <span className="pd-tab pd-tab-active">
                {locale === 'tr' ? 'Açıklama' : 'Description'}
              </span>
            </div>

            {product.description && (
              <div className="pd-description-content rich-text">
                <RichText content={product.description} />
              </div>
            )}

            {/* YouTube Videos */}
            {product.videos && product.videos.length > 0 && (
              <div className="pd-videos">
                <h3 className="pd-videos-heading">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  {locale === 'tr' ? 'İlgili Videolar' : 'Related Videos'}
                </h3>
                <div className="pd-videos-grid">
                  {product.videos.map((video, index) => (
                    <YouTubeVideo
                      key={index}
                      videoId={video.youtubeId}
                      title={video.title || undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.docs.length > 0 && (
        <section className="section" style={{ backgroundColor: 'var(--color-gray-100)' }}>
          <div className="container">
            <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {dict.products.relatedProducts}
            </h2>
            <div className="grid-4">
              {relatedProducts.docs.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
