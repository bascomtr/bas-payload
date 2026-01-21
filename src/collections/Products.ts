import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: {
      en: 'Product',
      tr: 'Ürün',
    },
    plural: {
      en: 'Products',
      tr: 'Ürünler',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'order', 'updatedAt'],
    group: {
      en: 'Products',
      tr: 'Ürünler',
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
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Short Description',
        tr: 'Kısa Açıklama',
      },
      admin: {
        description: {
          en: 'Brief description for listings',
          tr: 'Listeleme için kısa açıklama',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: {
        en: 'Description',
        tr: 'Açıklama',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Media',
            tr: 'Medya',
          },
          fields: [
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
              label: {
                en: 'Featured Image',
                tr: 'Öne Çıkan Görsel',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              label: {
                en: 'Gallery',
                tr: 'Galeri',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                  label: {
                    en: 'Caption',
                    tr: 'Açıklama',
                  },
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'Specifications',
            tr: 'Teknik Özellikler',
          },
          fields: [
            {
              name: 'specifications',
              type: 'array',
              label: {
                en: 'Technical Specifications',
                tr: 'Teknik Özellikler',
              },
              labels: {
                singular: {
                  en: 'Specification',
                  tr: 'Özellik',
                },
                plural: {
                  en: 'Specifications',
                  tr: 'Özellikler',
                },
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: {
                    en: 'Label',
                    tr: 'Etiket',
                  },
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: {
                    en: 'Value',
                    tr: 'Değer',
                  },
                },
              ],
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
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      required: true,
      label: {
        en: 'Category',
        tr: 'Kategori',
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: {
        en: 'Related Products',
        tr: 'İlgili Ürünler',
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
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: {
        en: 'Order',
        tr: 'Sıralama',
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Featured',
        tr: 'Öne Çıkan',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Show on homepage',
          tr: 'Ana sayfada göster',
        },
      },
    },
  ],
}
