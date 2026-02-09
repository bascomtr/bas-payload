'use client'

interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

// Cloudflare Image Transformations with R2 Custom Domain
// R2 CDN: cdn.bas.com.tr (direct R2 access)
// Transformations: demo.bas.com.tr/cdn-cgi/image/
// https://developers.cloudflare.com/images/pricing/
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const q = quality || 75
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://demo.bas.com.tr'
  const cdnUrl = 'https://cdn.bas.com.tr'

  // Skip optimization for SVGs and data URLs
  if (src.endsWith('.svg') || src.startsWith('data:')) {
    if (src.startsWith('/')) {
      return `${baseUrl}${src}`
    }
    return src
  }

  // Cloudflare transform options
  const options = [
    `width=${width}`,
    `quality=${q}`,
    'format=auto', // Auto WebP/AVIF based on browser
    'fit=cover',
  ].join(',')

  // Handle Payload media URLs - convert to R2 CDN URLs
  // /api/media/file/slider3.jpg -> https://cdn.bas.com.tr/slider3.jpg
  if (src.startsWith('/api/media/file/')) {
    const filename = src.replace('/api/media/file/', '')
    return `${baseUrl}/cdn-cgi/image/${options}/${cdnUrl}/${filename}`
  }

  // Handle absolute Payload media URLs
  if (src.includes('/api/media/file/')) {
    const filename = src.split('/api/media/file/').pop()
    return `${baseUrl}/cdn-cgi/image/${options}/${cdnUrl}/${filename}`
  }

  // Handle R2 CDN URLs directly
  if (src.includes('cdn.bas.com.tr')) {
    const url = new URL(src)
    return `${baseUrl}/cdn-cgi/image/${options}/${src}`
  }

  // For other relative URLs
  if (src.startsWith('/')) {
    return `${baseUrl}/cdn-cgi/image/${options}${src}`
  }

  // For absolute URLs pointing to our domain (not media)
  if (src.includes('bas.com.tr') || src.includes('bas-payload')) {
    const url = new URL(src)
    return `${baseUrl}/cdn-cgi/image/${options}${url.pathname}`
  }

  // For external URLs, pass through cdn-cgi
  return `${baseUrl}/cdn-cgi/image/${options}/${src}`
}
