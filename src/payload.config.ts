import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, Plugin } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { ProductCategories } from './collections/ProductCategories'
import { Projects } from './collections/Projects'
import { ProjectCategories } from './collections/ProjectCategories'
import { News } from './collections/News'
import { Pages } from './collections/Pages'
import { Team } from './collections/Team'

// Globals
import { SiteSettings } from './globals/SiteSettings'
import { Navigation } from './globals/Navigation'
import { Homepage } from './globals/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isSeed = process.env.PAYLOAD_SEED === 'true'
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare =
  isCLI || isSeed || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | BAS Endüstriyel',
    },
    avatar: 'gravatar',
  },
  collections: [
    // Admin
    Users,
    Media,
    // Products
    Products,
    ProductCategories,
    // Projects
    Projects,
    ProjectCategories,
    // Content
    News,
    Pages,
    Team,
  ],
  globals: [SiteSettings, Navigation, Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Localization configuration for SEO-friendly multi-language support
  localization: {
    locales: [
      {
        label: 'Türkçe',
        code: 'tr',
      },
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Español',
        code: 'es',
      },
      {
        label: 'Русский',
        code: 'ru',
      },
    ],
    defaultLocale: 'tr',
    fallback: true,
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    // Disable auto-push in dev to avoid conflicts with migrations
    push: false,
  }),
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        // Use wrangler.jsonc settings: D1 local, R2 remote
      } satisfies GetPlatformProxyOptions),
  )
}
