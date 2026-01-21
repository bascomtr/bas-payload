import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const ProductCategories: CollectionConfig = {
  slug: 'product-categories',
  labels: {
    singular: {
      en: 'Product Category',
      tr: 'Ürün Kategorisi',
    },
    plural: {
      en: 'Product Categories',
      tr: 'Ürün Kategorileri',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'order', 'updatedAt'],
    group: {
      en: 'Products',
      tr: 'Ürünler',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
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
    slugField({ fieldToUse: 'title' }),
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: {
        en: 'Description',
        tr: 'Açıklama',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'product-categories',
      label: {
        en: 'Parent Category',
        tr: 'Üst Kategori',
      },
      admin: {
        position: 'sidebar',
        description: {
          en: 'Select parent category for hierarchy',
          tr: 'Hiyerarşi için üst kategori seçin',
        },
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_equals: id,
          },
        }
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Category Image',
        tr: 'Kategori Görseli',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: {
        en: 'Order',
        tr: 'Sıralama',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
