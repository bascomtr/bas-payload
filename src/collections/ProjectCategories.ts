import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  labels: {
    singular: {
      en: 'Project Category',
      tr: 'Proje Kategorisi',
    },
    plural: {
      en: 'Project Categories',
      tr: 'Proje Kategorileri',
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'updatedAt'],
    group: {
      en: 'Projects',
      tr: 'Projeler',
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
