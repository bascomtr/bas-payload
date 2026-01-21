import type { Block } from 'payload'

export const ProductGridBlock: Block = {
  slug: 'productGrid',
  labels: {
    singular: {
      en: 'Product Grid',
      tr: 'Ürün Izgarası',
    },
    plural: {
      en: 'Product Grids',
      tr: 'Ürün Izgaraları',
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
      name: 'source',
      type: 'select',
      defaultValue: 'auto',
      label: {
        en: 'Product Source',
        tr: 'Ürün Kaynağı',
      },
      options: [
        { label: { en: 'Auto (Latest)', tr: 'Otomatik (Son Eklenen)' }, value: 'auto' },
        { label: { en: 'Featured', tr: 'Öne Çıkanlar' }, value: 'featured' },
        { label: { en: 'By Category', tr: 'Kategoriye Göre' }, value: 'category' },
        { label: { en: 'Manual Selection', tr: 'Manuel Seçim' }, value: 'manual' },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'product-categories',
      label: {
        en: 'Category',
        tr: 'Kategori',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'category',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      label: {
        en: 'Products',
        tr: 'Ürünler',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      label: {
        en: 'Number of Products',
        tr: 'Ürün Sayısı',
      },
      admin: {
        condition: (_, siblingData) =>
          siblingData?.source === 'auto' ||
          siblingData?.source === 'featured' ||
          siblingData?.source === 'category',
      },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      label: {
        en: 'Columns',
        tr: 'Sütun Sayısı',
      },
      options: [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    {
      name: 'showCTA',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Show View All Button',
        tr: 'Tümünü Gör Butonu Göster',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: {
        en: 'CTA Link',
        tr: 'Buton Bağlantısı',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.showCTA,
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      localized: true,
      label: {
        en: 'CTA Label',
        tr: 'Buton Metni',
      },
      admin: {
        condition: (_, siblingData) => siblingData?.showCTA,
      },
    },
  ],
}
