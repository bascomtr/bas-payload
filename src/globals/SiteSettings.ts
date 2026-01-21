import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: {
    en: 'Site Settings',
    tr: 'Site Ayarları',
  },
  admin: {
    group: {
      en: 'Settings',
      tr: 'Ayarlar',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'General',
            tr: 'Genel',
          },
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              localized: true,
              label: {
                en: 'Site Name',
                tr: 'Site Adı',
              },
              defaultValue: 'BAS Endüstriyel',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Site Description',
                tr: 'Site Açıklaması',
              },
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'logoDark',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Logo (Dark Mode)',
                tr: 'Logo (Koyu Mod)',
              },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
            },
          ],
        },
        {
          label: {
            en: 'Company Info',
            tr: 'Şirket Bilgileri',
          },
          fields: [
            {
              name: 'companyName',
              type: 'text',
              label: {
                en: 'Company Name',
                tr: 'Şirket Adı',
              },
              defaultValue: 'BAS Endüstriyel Çözümler ve Uygulama Ltd. Şti.',
            },
            {
              name: 'address',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Address',
                tr: 'Adres',
              },
            },
            {
              name: 'phone',
              type: 'text',
              label: {
                en: 'Phone',
                tr: 'Telefon',
              },
            },
            {
              name: 'email',
              type: 'email',
              label: 'E-posta',
            },
            {
              name: 'workingHours',
              type: 'text',
              localized: true,
              label: {
                en: 'Working Hours',
                tr: 'Çalışma Saatleri',
              },
            },
            {
              name: 'mapEmbed',
              type: 'textarea',
              label: {
                en: 'Google Maps Embed Code',
                tr: 'Google Harita Gömme Kodu',
              },
              admin: {
                description: {
                  en: 'Paste Google Maps embed iframe code',
                  tr: 'Google Harita iframe kodunu yapıştırın',
                },
              },
            },
          ],
        },
        {
          label: {
            en: 'Social Media',
            tr: 'Sosyal Medya',
          },
          fields: [
            {
              name: 'social',
              type: 'group',
              label: {
                en: 'Social Media Links',
                tr: 'Sosyal Medya Bağlantıları',
              },
              fields: [
                {
                  name: 'facebook',
                  type: 'text',
                  label: 'Facebook',
                },
                {
                  name: 'twitter',
                  type: 'text',
                  label: 'X (Twitter)',
                },
                {
                  name: 'linkedin',
                  type: 'text',
                  label: 'LinkedIn',
                },
                {
                  name: 'instagram',
                  type: 'text',
                  label: 'Instagram',
                },
                {
                  name: 'youtube',
                  type: 'text',
                  label: 'YouTube',
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'SEO Defaults',
            tr: 'SEO Varsayılanları',
          },
          fields: [
            {
              name: 'defaultMetaTitle',
              type: 'text',
              localized: true,
              label: {
                en: 'Default Meta Title',
                tr: 'Varsayılan Meta Başlık',
              },
            },
            {
              name: 'defaultMetaDescription',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Default Meta Description',
                tr: 'Varsayılan Meta Açıklama',
              },
            },
            {
              name: 'defaultOGImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Default Social Share Image',
                tr: 'Varsayılan Sosyal Paylaşım Görseli',
              },
            },
            {
              name: 'googleAnalyticsId',
              type: 'text',
              label: 'Google Analytics ID',
              admin: {
                description: 'G-XXXXXXXXXX',
              },
            },
            {
              name: 'googleTagManagerId',
              type: 'text',
              label: 'Google Tag Manager ID',
              admin: {
                description: 'GTM-XXXXXXX',
              },
            },
          ],
        },
        {
          label: {
            en: 'Footer',
            tr: 'Alt Bilgi',
          },
          fields: [
            {
              name: 'footerText',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Footer Text',
                tr: 'Alt Bilgi Metni',
              },
            },
            {
              name: 'copyrightText',
              type: 'text',
              localized: true,
              label: {
                en: 'Copyright Text',
                tr: 'Telif Hakkı Metni',
              },
            },
          ],
        },
      ],
    },
  ],
}
