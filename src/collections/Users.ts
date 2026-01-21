import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: {
      en: 'User',
      tr: 'Kullanıcı',
    },
    plural: {
      en: 'Users',
      tr: 'Kullanıcılar',
    },
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles', 'createdAt'],
    group: {
      en: 'Admin',
      tr: 'Yönetim',
    },
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return {
        id: {
          equals: user.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return {
        id: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      return user?.roles?.includes('admin') ?? false
    },
    create: ({ req: { user } }) => {
      return user?.roles?.includes('admin') ?? false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: {
        en: 'Name',
        tr: 'Ad Soyad',
      },
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: { en: 'Viewer', tr: 'Görüntüleyici' }, value: 'viewer' },
      ],
      label: {
        en: 'Roles',
        tr: 'Roller',
      },
      saveToJWT: true,
      access: {
        update: ({ req: { user } }) => user?.roles?.includes('admin') ?? false,
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: {
        en: 'Avatar',
        tr: 'Profil Fotoğrafı',
      },
    },
  ],
}
