import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'

export const News: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: {
      en: 'News',
      tr: 'Haber',
    },
    plural: {
      en: 'News',
      tr: 'Haberler',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'status', 'updatedAt'],
    group: {
      en: 'Content',
      tr: 'İçerik',
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            publishedAt: {
              less_than_equal: new Date().toISOString(),
            },
          },
        ],
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
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Excerpt',
        tr: 'Özet',
      },
      admin: {
        description: {
          en: 'Brief description for listings (max 200 characters)',
          tr: 'Listeleme için kısa açıklama (max 200 karakter)',
        },
      },
      maxLength: 200,
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: {
        en: 'Content',
        tr: 'İçerik',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Featured Image',
        tr: 'Öne Çıkan Görsel',
      },
    },
    seoFields,
    // Sidebar fields
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      label: {
        en: 'Publish Date',
        tr: 'Yayın Tarihi',
      },
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      label: {
        en: 'Author',
        tr: 'Yazar',
      },
      admin: {
        position: 'sidebar',
      },
    },
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
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: {
        en: 'Tags',
        tr: 'Etiketler',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
