import type { Block } from 'payload'

export const StatsBlock: Block = {
  slug: 'stats',
  labels: {
    singular: {
      en: 'Statistics',
      tr: 'İstatistikler',
    },
    plural: {
      en: 'Statistics',
      tr: 'İstatistikler',
    },
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: {
        en: 'Heading',
        tr: 'Başlık',
      },
    },
    {
      name: 'stats',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      label: {
        en: 'Statistics',
        tr: 'İstatistikler',
      },
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          label: {
            en: 'Value',
            tr: 'Değer',
          },
          admin: {
            description: {
              en: 'e.g., 500+, 25, 100%',
              tr: 'örn: 500+, 25, %100',
            },
          },
        },
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
          name: 'description',
          type: 'text',
          localized: true,
          label: {
            en: 'Description',
            tr: 'Açıklama',
          },
        },
        {
          name: 'icon',
          type: 'select',
          label: {
            en: 'Icon',
            tr: 'İkon',
          },
          options: [
            { label: { en: 'None', tr: 'Yok' }, value: 'none' },
            { label: { en: 'Users', tr: 'Kullanıcılar' }, value: 'users' },
            { label: { en: 'Projects', tr: 'Projeler' }, value: 'projects' },
            { label: { en: 'Countries', tr: 'Ülkeler' }, value: 'countries' },
            { label: { en: 'Years', tr: 'Yıllar' }, value: 'years' },
            { label: { en: 'Products', tr: 'Ürünler' }, value: 'products' },
            { label: { en: 'Award', tr: 'Ödül' }, value: 'award' },
          ],
        },
      ],
    },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'default',
      label: {
        en: 'Style',
        tr: 'Stil',
      },
      options: [
        { label: { en: 'Default', tr: 'Varsayılan' }, value: 'default' },
        { label: { en: 'Cards', tr: 'Kartlar' }, value: 'cards' },
        { label: { en: 'Inline', tr: 'Satır İçi' }, value: 'inline' },
        { label: { en: 'With Background', tr: 'Arka Planlı' }, value: 'withBackground' },
      ],
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Background Image',
        tr: 'Arka Plan Görseli',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.style === 'withBackground',
      },
    },
    {
      name: 'animate',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Animate Numbers',
        tr: 'Sayıları Animasyonla Göster',
      },
    },
  ],
}
