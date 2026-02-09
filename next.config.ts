import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: ['jose', 'pg-cloudflare'],

  // External images configuration - Using Cloudflare Image Transformations
  images: {
    loader: 'custom' as const,
    loaderFile: './src/lib/image-loader.ts',
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'images.pexels.com',
      },
      {
        // Payload API media (workers.dev subdomain)
        protocol: 'https' as const,
        hostname: 'bas-payload.young-wave-770a.workers.dev',
      },
      {
        // Payload API media (custom domain)
        protocol: 'https' as const,
        hostname: 'demo.bas.com.tr',
      },
      {
        // Localhost for development
        protocol: 'http' as const,
        hostname: 'localhost',
      },
      {
        // WordPress images (migration source)
        protocol: 'https' as const,
        hostname: 'bas.com.tr',
      },
      {
        // Cloudflare R2 public bucket (if configured)
        protocol: 'https' as const,
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        // Cloudflare R2 custom domain
        protocol: 'https' as const,
        hostname: 'cdn.bas.com.tr',
      },
    ],
  },

  // Your Next.js config here
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
