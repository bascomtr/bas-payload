import type { GlobalConfig } from 'payload'
import { allBlocks } from '../blocks'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: {
    en: 'Homepage',
    tr: 'Ana Sayfa',
  },
  admin: {
    group: {
      en: 'Content',
      tr: 'İçerik',
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
            en: 'Hero Section',
            tr: 'Hero Bölümü',
          },
          fields: [
            {
              name: 'heroType',
              type: 'select',
              defaultValue: 'slider',
              label: {
                en: 'Hero Type',
                tr: 'Hero Tipi',
              },
              options: [
                { label: { en: 'Single Image', tr: 'Tek Görsel' }, value: 'single' },
                { label: { en: 'Slider', tr: 'Slider' }, value: 'slider' },
                { label: { en: 'Video', tr: 'Video' }, value: 'video' },
              ],
            },
            {
              name: 'heroSlides',
              type: 'array',
              label: {
                en: 'Hero Slides',
                tr: 'Hero Slaytları',
              },
              minRows: 1,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: {
                    en: 'Heading',
                    tr: 'Başlık',
                  },
                },
                {
                  name: 'subheading',
                  type: 'textarea',
                  localized: true,
                  label: {
                    en: 'Subheading',
                    tr: 'Alt Başlık',
                  },
                },
                {
                  name: 'backgroundImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: {
                    en: 'Background Image',
                    tr: 'Arka Plan Görseli',
                  },
                },
                {
                  name: 'buttonLabel',
                  type: 'text',
                  localized: true,
                  label: {
                    en: 'Button Label',
                    tr: 'Buton Metni',
                  },
                },
                {
                  name: 'buttonLink',
                  type: 'text',
                  label: {
                    en: 'Button Link',
                    tr: 'Buton Bağlantısı',
                  },
                },
              ],
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.heroType === 'slider' || siblingData?.heroType === 'single',
              },
            },
            {
              name: 'heroVideo',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Hero Video',
                tr: 'Hero Videosu',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.heroType === 'video',
              },
            },
            {
              name: 'heroVideoHeading',
              type: 'text',
              localized: true,
              label: {
                en: 'Video Overlay Heading',
                tr: 'Video Üstü Başlık',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.heroType === 'video',
              },
            },
          ],
        },
        {
          label: {
            en: 'Page Content',
            tr: 'Sayfa İçeriği',
          },
          fields: [
            {
              name: 'content',
              type: 'blocks',
              blocks: allBlocks,
              label: {
                en: 'Content Blocks',
                tr: 'İçerik Blokları',
              },
            },
          ],
        },
        {
          label: {
            en: 'Featured Sections',
            tr: 'Öne Çıkan Bölümler',
          },
          fields: [
            {
              name: 'showFeaturedProducts',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Show Featured Products',
                tr: 'Öne Çıkan Ürünleri Göster',
              },
            },
            {
              name: 'featuredProductsTitle',
              type: 'text',
              localized: true,
              label: {
                en: 'Featured Products Title',
                tr: 'Öne Çıkan Ürünler Başlığı',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.showFeaturedProducts,
              },
            },
            {
              name: 'featuredProductsLimit',
              type: 'number',
              defaultValue: 6,
              label: {
                en: 'Number of Products',
                tr: 'Ürün Sayısı',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.showFeaturedProducts,
              },
            },
            {
              name: 'showFeaturedProjects',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Show Featured Projects',
                tr: 'Öne Çıkan Projeleri Göster',
              },
            },
            {
              name: 'featuredProjectsTitle',
              type: 'text',
              localized: true,
              label: {
                en: 'Featured Projects Title',
                tr: 'Öne Çıkan Projeler Başlığı',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.showFeaturedProjects,
              },
            },
            {
              name: 'featuredProjectsLimit',
              type: 'number',
              defaultValue: 3,
              label: {
                en: 'Number of Projects',
                tr: 'Proje Sayısı',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.showFeaturedProjects,
              },
            },
            {
              name: 'showLatestNews',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Show Latest News',
                tr: 'Son Haberleri Göster',
              },
            },
            {
              name: 'latestNewsTitle',
              type: 'text',
              localized: true,
              label: {
                en: 'Latest News Title',
                tr: 'Son Haberler Başlığı',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.showLatestNews,
              },
            },
            {
              name: 'latestNewsLimit',
              type: 'number',
              defaultValue: 4,
              label: {
                en: 'Number of News',
                tr: 'Haber Sayısı',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.showLatestNews,
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              type: 'text',
              localized: true,
              label: {
                en: 'Meta Title',
                tr: 'Meta Başlık',
              },
            },
            {
              name: 'metaDescription',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Meta Description',
                tr: 'Meta Açıklama',
              },
            },
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Social Share Image',
                tr: 'Sosyal Paylaşım Görseli',
              },
            },
          ],
        },
      ],
    },
  ],
}
