import type { Block } from 'payload'

export const TimelineBlock: Block = {
  slug: 'timeline',
  labels: {
    singular: {
      en: 'Timeline',
      tr: 'Zaman Çizelgesi',
    },
    plural: {
      en: 'Timelines',
      tr: 'Zaman Çizelgeleri',
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Description',
        tr: 'Açıklama',
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      label: {
        en: 'Timeline Items',
        tr: 'Zaman Çizelgesi Öğeleri',
      },
      fields: [
        {
          name: 'year',
          type: 'text',
          required: true,
          label: {
            en: 'Year',
            tr: 'Yıl',
          },
        },
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
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          label: {
            en: 'Description',
            tr: 'Açıklama',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Image',
            tr: 'Görsel',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'alternating',
      label: {
        en: 'Layout',
        tr: 'Düzen',
      },
      options: [
        { label: { en: 'Alternating', tr: 'Değişen' }, value: 'alternating' },
        { label: { en: 'Left', tr: 'Sol' }, value: 'left' },
        { label: { en: 'Right', tr: 'Sağ' }, value: 'right' },
        { label: { en: 'Horizontal', tr: 'Yatay' }, value: 'horizontal' },
      ],
    },
  ],
}
