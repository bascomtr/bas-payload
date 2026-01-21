import type { Field } from 'payload'

export const seoFields: Field = {
  name: 'meta',
  type: 'group',
  label: 'SEO',
  localized: true,
  admin: {
    description: 'Arama motoru optimizasyonu için meta bilgileri',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Meta Başlık',
      admin: {
        description: 'Sayfa başlığı (60 karakter önerilir)',
      },
      maxLength: 70,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Meta Açıklama',
      admin: {
        description: 'Sayfa açıklaması (160 karakter önerilir)',
      },
      maxLength: 170,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'OG Görsel',
      admin: {
        description: 'Sosyal medya paylaşımlarında görünecek görsel (1200x630 önerilir)',
      },
    },
    {
      name: 'keywords',
      type: 'text',
      label: 'Anahtar Kelimeler',
      admin: {
        description: 'Virgülle ayrılmış anahtar kelimeler',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      label: 'Arama motorlarından gizle',
      defaultValue: false,
      admin: {
        description: 'Bu sayfa arama sonuçlarında görünmeyecek',
      },
    },
  ],
}

export const seoFieldsSimple: Field[] = [
  {
    name: 'metaTitle',
    type: 'text',
    label: 'Meta Başlık',
    localized: true,
    admin: {
      position: 'sidebar',
      description: 'SEO başlığı (boş bırakılırsa sayfa başlığı kullanılır)',
    },
    maxLength: 70,
  },
  {
    name: 'metaDescription',
    type: 'textarea',
    label: 'Meta Açıklama',
    localized: true,
    admin: {
      position: 'sidebar',
      description: 'SEO açıklaması (160 karakter önerilir)',
    },
    maxLength: 170,
  },
]
