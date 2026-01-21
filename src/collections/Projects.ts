import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoFields } from '../fields/seo'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: {
      en: 'Project',
      tr: 'Proje',
    },
    plural: {
      en: 'Projects',
      tr: 'Projeler',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'location', 'completionDate', 'featured', 'updatedAt'],
    group: {
      en: 'Projects',
      tr: 'Projeler',
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
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Excerpt',
        tr: 'Özet',
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
            en: 'Details',
            tr: 'Detaylar',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'client',
                  type: 'text',
                  label: {
                    en: 'Client',
                    tr: 'Müşteri',
                  },
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'location',
                  type: 'text',
                  localized: true,
                  label: {
                    en: 'Location',
                    tr: 'Konum',
                  },
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'completionDate',
                  type: 'date',
                  label: {
                    en: 'Completion Date',
                    tr: 'Tamamlanma Tarihi',
                  },
                  admin: {
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd/MM/yyyy',
                    },
                  },
                },
                {
                  name: 'projectType',
                  type: 'select',
                  label: {
                    en: 'Project Type',
                    tr: 'Proje Tipi',
                  },
                  options: [
                    {
                      label: { en: 'Turnkey Plant', tr: 'Anahtar Teslim Tesis' },
                      value: 'turnkey',
                    },
                    {
                      label: { en: 'Equipment Supply', tr: 'Ekipman Tedariki' },
                      value: 'equipment',
                    },
                    {
                      label: { en: 'Consultancy', tr: 'Danışmanlık' },
                      value: 'consultancy',
                    },
                    {
                      label: { en: 'Service', tr: 'Servis' },
                      value: 'service',
                    },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'highlights',
              type: 'array',
              label: {
                en: 'Project Highlights',
                tr: 'Proje Öne Çıkanları',
              },
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  localized: true,
                },
              ],
            },
          ],
        },
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
          label: 'SEO',
          fields: [seoFields],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'project-categories',
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
  ],
}
