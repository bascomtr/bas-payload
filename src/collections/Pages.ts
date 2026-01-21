import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'
import { allBlocks } from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: {
      en: 'Page',
      tr: 'Sayfa',
    },
    plural: {
      en: 'Pages',
      tr: 'Sayfalar',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: {
      en: 'Content',
      tr: 'İçerik',
    },
    livePreview: {
      url: ({ data, locale }) => {
        const slug = typeof data?.slug === 'string' ? data.slug : ''
        return `/${locale.code}/${slug}`
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        status: {
          equals: 'published',
        },
      }
    },
  },
  versions: {
    drafts: {
      autosave: true,
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Title',
        tr: 'Başlık',
      },
    },
    slugField({ fieldToUse: 'title' }),
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Content',
            tr: 'İçerik',
          },
          fields: [
            {
              name: 'heroType',
              type: 'select',
              defaultValue: 'simple',
              label: {
                en: 'Hero Type',
                tr: 'Hero Tipi',
              },
              options: [
                { label: { en: 'None', tr: 'Yok' }, value: 'none' },
                { label: { en: 'Simple', tr: 'Basit' }, value: 'simple' },
                { label: { en: 'With Image', tr: 'Görsel ile' }, value: 'withImage' },
                { label: { en: 'Full Width', tr: 'Tam Genişlik' }, value: 'fullWidth' },
              ],
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Hero Image',
                tr: 'Hero Görseli',
              },
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.heroType === 'withImage' || siblingData?.heroType === 'fullWidth',
              },
            },
            {
              name: 'heroSubtitle',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Hero Subtitle',
                tr: 'Hero Alt Başlık',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.heroType !== 'none',
              },
            },
            {
              name: 'content',
              type: 'blocks',
              blocks: allBlocks,
              label: {
                en: 'Page Content',
                tr: 'Sayfa İçeriği',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoFields],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: { en: 'Draft', tr: 'Taslak' }, value: 'draft' },
        { label: { en: 'Published', tr: 'Yayında' }, value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: {
        en: 'Parent Page',
        tr: 'Üst Sayfa',
      },
      admin: {
        position: 'sidebar',
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_equals: id,
          },
        }
      },
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Show in Navigation',
        tr: 'Navigasyonda Göster',
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'navOrder',
      type: 'number',
      defaultValue: 0,
      label: {
        en: 'Navigation Order',
        tr: 'Navigasyon Sırası',
      },
      admin: {
        position: 'sidebar',
        condition: (_, siblingData) => siblingData?.showInNav,
      },
    },
  ],
}
