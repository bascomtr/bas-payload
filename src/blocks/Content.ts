import type { Block } from 'payload'

export const ContentBlock: Block = {
  slug: 'content',
  labels: {
    singular: {
      en: 'Content Block',
      tr: 'İçerik Bloğu',
    },
    plural: {
      en: 'Content Blocks',
      tr: 'İçerik Blokları',
    },
  },
  fields: [
    {
      name: 'columns',
      type: 'select',
      defaultValue: 'one',
      label: {
        en: 'Layout',
        tr: 'Düzen',
      },
      options: [
        { label: { en: 'Single Column', tr: 'Tek Sütun' }, value: 'one' },
        { label: { en: 'Two Columns', tr: 'İki Sütun' }, value: 'two' },
        { label: { en: 'Two Columns (Wide Left)', tr: 'İki Sütun (Geniş Sol)' }, value: 'twoWideLeft' },
        { label: { en: 'Two Columns (Wide Right)', tr: 'İki Sütun (Geniş Sağ)' }, value: 'twoWideRight' },
        { label: { en: 'Three Columns', tr: 'Üç Sütun' }, value: 'three' },
      ],
    },
    {
      name: 'contentItems',
      type: 'array',
      minRows: 1,
      maxRows: 3,
      label: {
        en: 'Content Items',
        tr: 'İçerik Öğeleri',
      },
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
          localized: true,
          label: {
            en: 'Content',
            tr: 'İçerik',
          },
        },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'select',
      defaultValue: 'white',
      label: {
        en: 'Background Color',
        tr: 'Arka Plan Rengi',
      },
      options: [
        { label: { en: 'White', tr: 'Beyaz' }, value: 'white' },
        { label: { en: 'Light Gray', tr: 'Açık Gri' }, value: 'lightGray' },
        { label: { en: 'Dark', tr: 'Koyu' }, value: 'dark' },
        { label: { en: 'Primary', tr: 'Ana Renk' }, value: 'primary' },
      ],
    },
    {
      name: 'paddingTop',
      type: 'select',
      defaultValue: 'medium',
      label: {
        en: 'Top Padding',
        tr: 'Üst Boşluk',
      },
      options: [
        { label: { en: 'None', tr: 'Yok' }, value: 'none' },
        { label: { en: 'Small', tr: 'Küçük' }, value: 'small' },
        { label: { en: 'Medium', tr: 'Orta' }, value: 'medium' },
        { label: { en: 'Large', tr: 'Büyük' }, value: 'large' },
      ],
    },
    {
      name: 'paddingBottom',
      type: 'select',
      defaultValue: 'medium',
      label: {
        en: 'Bottom Padding',
        tr: 'Alt Boşluk',
      },
      options: [
        { label: { en: 'None', tr: 'Yok' }, value: 'none' },
        { label: { en: 'Small', tr: 'Küçük' }, value: 'small' },
        { label: { en: 'Medium', tr: 'Orta' }, value: 'medium' },
        { label: { en: 'Large', tr: 'Büyük' }, value: 'large' },
      ],
    },
  ],
}
