import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: {
    singular: {
      en: 'Testimonials',
      tr: 'Referanslar',
    },
    plural: {
      en: 'Testimonials',
      tr: 'Referanslar',
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
      name: 'testimonials',
      type: 'array',
      required: true,
      minRows: 1,
      label: {
        en: 'Testimonials',
        tr: 'Referanslar',
      },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          localized: true,
          label: {
            en: 'Quote',
            tr: 'Alıntı',
          },
        },
        {
          name: 'author',
          type: 'text',
          required: true,
          label: {
            en: 'Author Name',
            tr: 'Yazar Adı',
          },
        },
        {
          name: 'position',
          type: 'text',
          localized: true,
          label: {
            en: 'Position',
            tr: 'Pozisyon',
          },
        },
        {
          name: 'company',
          type: 'text',
          label: {
            en: 'Company',
            tr: 'Şirket',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Avatar',
            tr: 'Fotoğraf',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: {
            en: 'Company Logo',
            tr: 'Şirket Logosu',
          },
        },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'carousel',
      label: {
        en: 'Layout',
        tr: 'Düzen',
      },
      options: [
        { label: { en: 'Carousel', tr: 'Karusel' }, value: 'carousel' },
        { label: { en: 'Grid', tr: 'Izgara' }, value: 'grid' },
        { label: { en: 'Single', tr: 'Tekli' }, value: 'single' },
      ],
    },
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Autoplay',
        tr: 'Otomatik Oynat',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'carousel',
      },
    },
  ],
}
