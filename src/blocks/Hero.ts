import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: {
    singular: {
      en: 'Hero Section',
      tr: 'Hero Bölümü',
    },
    plural: {
      en: 'Hero Sections',
      tr: 'Hero Bölümleri',
    },
  },
  imageURL: '/api/media/file/hero-block-preview.png',
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
      name: 'backgroundVideo',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Background Video',
        tr: 'Arka Plan Videosu',
      },
      admin: {
        description: {
          en: 'Optional video background (overrides image)',
          tr: 'Opsiyonel video arka planı (görseli geçersiz kılar)',
        },
      },
    },
    {
      name: 'overlay',
      type: 'select',
      defaultValue: 'medium',
      label: {
        en: 'Overlay Darkness',
        tr: 'Karartma Seviyesi',
      },
      options: [
        { label: { en: 'None', tr: 'Yok' }, value: 'none' },
        { label: { en: 'Light', tr: 'Hafif' }, value: 'light' },
        { label: { en: 'Medium', tr: 'Orta' }, value: 'medium' },
        { label: { en: 'Dark', tr: 'Koyu' }, value: 'dark' },
      ],
    },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 2,
      label: {
        en: 'Buttons',
        tr: 'Butonlar',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Button Label',
            tr: 'Buton Metni',
          },
        },
        {
          name: 'link',
          type: 'text',
          required: true,
          label: {
            en: 'Link',
            tr: 'Bağlantı',
          },
        },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
      ],
    },
    {
      name: 'height',
      type: 'select',
      defaultValue: 'full',
      label: {
        en: 'Height',
        tr: 'Yükseklik',
      },
      options: [
        { label: { en: 'Full Screen', tr: 'Tam Ekran' }, value: 'full' },
        { label: { en: 'Large', tr: 'Büyük' }, value: 'large' },
        { label: { en: 'Medium', tr: 'Orta' }, value: 'medium' },
      ],
    },
    {
      name: 'textAlign',
      type: 'select',
      defaultValue: 'center',
      label: {
        en: 'Text Alignment',
        tr: 'Metin Hizalama',
      },
      options: [
        { label: { en: 'Left', tr: 'Sol' }, value: 'left' },
        { label: { en: 'Center', tr: 'Orta' }, value: 'center' },
        { label: { en: 'Right', tr: 'Sağ' }, value: 'right' },
      ],
    },
  ],
}
