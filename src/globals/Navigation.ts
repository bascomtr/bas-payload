import type { Field, GlobalConfig } from 'payload'

const linkFields: Field[] = [
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
    name: 'type',
    type: 'select',
    defaultValue: 'internal',
    options: [
      { label: { en: 'Internal Link', tr: 'İç Bağlantı' }, value: 'internal' },
      { label: { en: 'External Link', tr: 'Dış Bağlantı' }, value: 'external' },
    ],
  },
  {
    name: 'internalLink',
    type: 'relationship',
    relationTo: ['pages', 'products', 'product-categories', 'projects', 'project-categories', 'news'],
    label: {
      en: 'Internal Link',
      tr: 'İç Bağlantı',
    },
    admin: {
      condition: (_: unknown, siblingData: { type?: string }) => siblingData?.type === 'internal',
    },
  },
  {
    name: 'externalLink',
    type: 'text',
    label: {
      en: 'External URL',
      tr: 'Dış Bağlantı URL',
    },
    admin: {
      condition: (_: unknown, siblingData: { type?: string }) => siblingData?.type === 'external',
    },
  },
  {
    name: 'openInNewTab',
    type: 'checkbox',
    defaultValue: false,
    label: {
      en: 'Open in New Tab',
      tr: 'Yeni Sekmede Aç',
    },
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: {
    en: 'Navigation',
    tr: 'Navigasyon',
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
            en: 'Main Menu',
            tr: 'Ana Menü',
          },
          fields: [
            {
              name: 'mainMenu',
              type: 'array',
              label: {
                en: 'Menu Items',
                tr: 'Menü Öğeleri',
              },
              fields: [
                ...linkFields,
                {
                  name: 'children',
                  type: 'array',
                  label: {
                    en: 'Submenu Items',
                    tr: 'Alt Menü Öğeleri',
                  },
                  fields: linkFields,
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'Footer Menu',
            tr: 'Alt Bilgi Menüsü',
          },
          fields: [
            {
              name: 'footerColumns',
              type: 'array',
              label: {
                en: 'Footer Columns',
                tr: 'Alt Bilgi Sütunları',
              },
              maxRows: 4,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                  label: {
                    en: 'Column Title',
                    tr: 'Sütun Başlığı',
                  },
                },
                {
                  name: 'links',
                  type: 'array',
                  label: {
                    en: 'Links',
                    tr: 'Bağlantılar',
                  },
                  fields: linkFields,
                },
              ],
            },
          ],
        },
        {
          label: {
            en: 'Top Bar',
            tr: 'Üst Bar',
          },
          fields: [
            {
              name: 'showTopBar',
              type: 'checkbox',
              defaultValue: true,
              label: {
                en: 'Show Top Bar',
                tr: 'Üst Barı Göster',
              },
            },
            {
              name: 'topBarContent',
              type: 'textarea',
              localized: true,
              label: {
                en: 'Top Bar Content',
                tr: 'Üst Bar İçeriği',
              },
              admin: {
                condition: (_, siblingData) => siblingData?.showTopBar,
              },
            },
            {
              name: 'topBarLinks',
              type: 'array',
              label: {
                en: 'Top Bar Links',
                tr: 'Üst Bar Bağlantıları',
              },
              maxRows: 4,
              fields: linkFields,
              admin: {
                condition: (_, siblingData) => siblingData?.showTopBar,
              },
            },
          ],
        },
      ],
    },
  ],
}
