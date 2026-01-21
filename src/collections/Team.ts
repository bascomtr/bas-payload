import type { CollectionConfig } from 'payload'

export const Team: CollectionConfig = {
  slug: 'team',
  labels: {
    singular: {
      en: 'Team Member',
      tr: 'Ekip Üyesi',
    },
    plural: {
      en: 'Team',
      tr: 'Ekip',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'position', 'department', 'order', 'updatedAt'],
    group: {
      en: 'Content',
      tr: 'İçerik',
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Name',
        tr: 'Ad Soyad',
      },
    },
    {
      name: 'position',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Position',
        tr: 'Pozisyon',
      },
    },
    {
      name: 'department',
      type: 'select',
      label: {
        en: 'Department',
        tr: 'Departman',
      },
      options: [
        { label: { en: 'Management', tr: 'Yönetim' }, value: 'management' },
        { label: { en: 'Engineering', tr: 'Mühendislik' }, value: 'engineering' },
        { label: { en: 'Sales', tr: 'Satış' }, value: 'sales' },
        { label: { en: 'Service', tr: 'Servis' }, value: 'service' },
        { label: { en: 'Administration', tr: 'İdari' }, value: 'administration' },
      ],
    },
    {
      name: 'bio',
      type: 'textarea',
      localized: true,
      label: {
        en: 'Biography',
        tr: 'Biyografi',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Photo',
        tr: 'Fotoğraf',
      },
    },
    {
      name: 'contact',
      type: 'group',
      label: {
        en: 'Contact Information',
        tr: 'İletişim Bilgileri',
      },
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'E-posta',
        },
        {
          name: 'phone',
          type: 'text',
          label: {
            en: 'Phone',
            tr: 'Telefon',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn',
          admin: {
            description: 'LinkedIn profil URL',
          },
        },
      ],
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
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: {
        en: 'Active',
        tr: 'Aktif',
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
