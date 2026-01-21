import { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { type Locale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/dictionaries'
import { ContactForm } from '@/components/forms/ContactForm'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

interface ContactPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ product?: string }>
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return {
    title: dict.contact?.title || 'İletişim',
    description:
      locale === 'tr'
        ? 'BAS Manyetik ile iletişime geçin. Ürünlerimiz ve hizmetlerimiz hakkında bilgi alın.'
        : 'Contact BAS Manyetik. Get information about our products and services.',
    alternates: {
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `/${loc}/iletisim`])
      ),
    },
  }
}

export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  const { locale } = await params
  const { product } = await searchParams
  const dict = await getDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch site settings for contact info
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    locale,
  })

  const breadcrumbItems = [
    { label: dict.contact?.title || 'İletişim' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-16 md:py-24">
        <div className="container">
          <Breadcrumb items={breadcrumbItems} locale={locale} />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            {dict.contact?.title || 'İletişim'}
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl">
            {locale === 'tr'
              ? 'Sorularınız için bize ulaşın. Size en kısa sürede dönüş yapacağız.'
              : 'Contact us for your questions. We will get back to you as soon as possible.'}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-6">
                {locale === 'tr' ? 'İletişim Bilgileri' : 'Contact Information'}
              </h2>

              <div className="space-y-6">
                {/* Address */}
                {siteSettings?.address && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {dict.contact?.address || 'Adres'}
                      </h3>
                      <p className="text-gray-600 mt-1 whitespace-pre-line">
                        {siteSettings.address}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {siteSettings?.phone && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {dict.contact?.phone || 'Telefon'}
                      </h3>
                      <a
                        href={`tel:${siteSettings.phone}`}
                        className="text-gray-600 mt-1 hover:text-primary transition-colors"
                      >
                        {siteSettings.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {siteSettings?.email && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {dict.contact?.email || 'E-posta'}
                      </h3>
                      <a
                        href={`mailto:${siteSettings.email}`}
                        className="text-gray-600 mt-1 hover:text-primary transition-colors"
                      >
                        {siteSettings.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                {siteSettings?.workingHours && (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {dict.contact?.workingHours || 'Çalışma Saatleri'}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {siteSettings.workingHours}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6">
                  {dict.contact?.sendMessage || 'Mesaj Gönder'}
                </h2>
                <ContactForm locale={locale} productSlug={product} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      {siteSettings?.mapEmbed && (
        <section className="h-[400px] md:h-[500px]">
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: siteSettings.mapEmbed }}
          />
        </section>
      )}
    </div>
  )
}
