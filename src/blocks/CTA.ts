import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: {
    singular: {
      en: 'Call to Action',
      tr: 'Eylem Çağrısı',
    },
    plural: {
      en: 'Call to Actions',
      tr: 'Eylem Çağrıları',
    },
  },
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
      name: 'description',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Description',
        tr: 'Açıklama',
      },
    },
    {
      name: 'buttons',
      type: 'array',
      minRows: 1,
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
        {
          name: 'icon',
          type: 'select',
          label: {
            en: 'Icon',
            tr: 'İkon',
          },
          options: [
            { label: { en: 'None', tr: 'Yok' }, value: 'none' },
            { label: { en: 'Arrow Right', tr: 'Sağ Ok' }, value: 'arrowRight' },
            { label: { en: 'Phone', tr: 'Telefon' }, value: 'phone' },
            { label: { en: 'Email', tr: 'E-posta' }, value: 'email' },
            { label: { en: 'Download', tr: 'İndir' }, value: 'download' },
          ],
        },
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
        { label: { en: 'Centered', tr: 'Ortalanmış' }, value: 'centered' },
        { label: { en: 'With Image', tr: 'Görsel ile' }, value: 'withImage' },
        { label: { en: 'Full Width', tr: 'Tam Genişlik' }, value: 'fullWidth' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      defaultValue: 'primary',
      label: {
        en: 'Background Color',
        tr: 'Arka Plan Rengi',
      },
      options: [
        { label: { en: 'Primary', tr: 'Ana Renk' }, value: 'primary' },
        { label: { en: 'Secondary', tr: 'İkincil Renk' }, value: 'secondary' },
        { label: { en: 'Dark', tr: 'Koyu' }, value: 'dark' },
        { label: { en: 'Light', tr: 'Açık' }, value: 'light' },
      ],
    },
  ],
}
