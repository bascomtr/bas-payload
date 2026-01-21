import type { Field } from 'payload'

type SlugFieldOptions = {
  fieldToUse?: string
  overrides?: Partial<Field>
}

export const slugField = (options: SlugFieldOptions = {}): Field => {
  const { fieldToUse = 'title', overrides = {} } = options

  return {
    name: 'slug',
    type: 'text',
    required: true,
    unique: true,
    index: true,
    localized: true,
    admin: {
      position: 'sidebar',
      description: 'SEO uyumlu URL. Otomatik oluşturulur veya manuel girilebilir.',
    },
    hooks: {
      beforeValidate: [
        ({ value, siblingData }) => {
          if (typeof value === 'string' && value.length > 0) {
            return slugify(value)
          }

          const fieldValue = siblingData?.[fieldToUse]
          if (typeof fieldValue === 'string' && fieldValue.length > 0) {
            return slugify(fieldValue)
          }

          return value
        },
      ],
    },
    ...overrides,
  } as Field
}

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ç: 'c',
    Ç: 'C',
    ğ: 'g',
    Ğ: 'G',
    ı: 'i',
    İ: 'I',
    ö: 'o',
    Ö: 'O',
    ş: 's',
    Ş: 'S',
    ü: 'u',
    Ü: 'U',
  }

  let result = text.toLowerCase()

  // Replace Turkish characters
  for (const [turkish, latin] of Object.entries(turkishMap)) {
    result = result.replace(new RegExp(turkish, 'g'), latin.toLowerCase())
  }

  return result
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}
