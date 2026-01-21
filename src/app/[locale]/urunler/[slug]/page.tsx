import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, locales, getTranslatedPath } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { RichText } from '@/components/ui/RichText'
import { ProductCard } from '@/components/cards/ProductCard'
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

  const featuredImage = product.featuredImage as Media | undefined

  return (
    <article className="section">
      <div className="container">
        <div className="grid-2 gap-12">
          {/* Product Images */}
          <div>
            {featuredImage && (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={featuredImage.url || ''}
                  alt={featuredImage.alt || product.title || ''}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Gallery */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.gallery.map((item, index) => {
                  const image = item.image as Media
                  return (
                    <div
                      key={index}
                      className="relative aspect-square rounded overflow-hidden bg-gray-100"
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
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

            {product.shortDescription && (
              <p className="text-lg text-gray-600 mb-6">
                {product.shortDescription}
              </p>
            )}

            {product.description && (
              <div className="rich-text mb-8">
                <RichText content={product.description} />
              </div>
            )}

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">
                  {dict.products.specifications}
                </h2>
                <table className="w-full">
                  <tbody>
                    {product.specifications.map((spec, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-gray-50' : ''}
                      >
                        <td className="py-2 px-4 font-medium">{spec.label}</td>
                        <td className="py-2 px-4">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8">
              <a
                href={`/${locale}/iletisim?product=${product.slug}`}
                className="btn btn-primary"
              >
                {dict.products.requestQuote}
              </a>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.docs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">
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
          </section>
        )}
      </div>
    </article>
  )
}
