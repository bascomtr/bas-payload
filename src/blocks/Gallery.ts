import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: {
    singular: {
      en: 'Gallery',
      tr: 'Galeri',
    },
    plural: {
      en: 'Galleries',
      tr: 'Galeriler',
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
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      label: {
        en: 'Images',
        tr: 'Görseller',
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
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'grid',
      label: {
        en: 'Layout',
        tr: 'Düzen',
      },
      options: [
        { label: { en: 'Grid', tr: 'Izgara' }, value: 'grid' },
        { label: { en: 'Masonry', tr: 'Masonry' }, value: 'masonry' },
        { label: { en: 'Carousel', tr: 'Karusel' }, value: 'carousel' },
        { label: { en: 'Lightbox', tr: 'Lightbox' }, value: 'lightbox' },
      ],
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
        { label: '5', value: '5' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.layout !== 'carousel',
      },
    },
    {
      name: 'gap',
      type: 'select',
      defaultValue: 'medium',
      label: {
        en: 'Gap',
        tr: 'Boşluk',
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
