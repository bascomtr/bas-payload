import Image from 'next/image'
import { type Locale } from '@/i18n/config'
import type { Team, Media } from '@/payload-types'

interface TeamGridProps {
  members: Team[]
  locale: Locale
  title?: string
  subtitle?: string
  showContact?: boolean
}

export function TeamGrid({
  members,
  locale,
  title,
  subtitle,
  showContact = true,
}: TeamGridProps) {
  if (!members || members.length === 0) return null

  // Department labels
  const departmentLabels: Record<string, Record<Locale, string>> = {
    management: { tr: 'Yönetim', en: 'Management', es: 'Dirección', ru: 'Руководство' },
    engineering: { tr: 'Mühendislik', en: 'Engineering', es: 'Ingeniería', ru: 'Инженерия' },
    sales: { tr: 'Satış', en: 'Sales', es: 'Ventas', ru: 'Продажи' },
    service: { tr: 'Servis', en: 'Service', es: 'Servicio', ru: 'Сервис' },
    administration: { tr: 'İdari', en: 'Administration', es: 'Administración', ru: 'Администрация' },
  }

  return (
    <section className="section">
      <div className="container">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {members.map((member) => {
            const photo = member.photo as Media | undefined
            const department = member.department as string | undefined

            return (
              <div
                key={member.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Photo */}
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  {photo?.url ? (
                    <Image
                      src={photo.url}
                      alt={photo.alt || member.name || ''}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg
                        className="w-20 h-20 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Social Links Overlay */}
                  {showContact && member.contact?.linkedin && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <a
                        href={member.contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900">
                    {member.name}
                  </h3>
                  
                  {member.position && (
                    <p className="text-primary font-medium mt-1">
                      {member.position}
                    </p>
                  )}

                  {department && (
                    <p className="text-sm text-gray-500 mt-1">
                      {departmentLabels[department]?.[locale] || department}
                    </p>
                  )}

                  {/* Contact Info */}
                  {showContact && (member.contact?.email || member.contact?.phone) && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                      {member.contact.email && (
                        <a
                          href={`mailto:${member.contact.email}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.contact.email}
                        </a>
                      )}
                      {member.contact.phone && (
                        <a
                          href={`tel:${member.contact.phone}`}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {member.contact.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Compact version for use in sidebars or smaller sections
export function TeamGridCompact({
  members,
  locale: _locale,
  title,
}: {
  members: Team[]
  locale: Locale
  title?: string
}) {
  if (!members || members.length === 0) return null

  return (
    <div>
      {title && (
        <h3 className="font-bold text-lg mb-4">{title}</h3>
      )}
      <div className="space-y-4">
        {members.map((member) => {
          const photo = member.photo as Media | undefined

          return (
            <div key={member.id} className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {photo?.url ? (
                  <Image
                    src={photo.url}
                    alt={photo.alt || member.name || ''}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{member.name}</p>
                {member.position && (
                  <p className="text-sm text-gray-500">{member.position}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
