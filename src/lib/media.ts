import type { Media } from '@/payload-types'

// Production URL - hardcoded for reliability
const PRODUCTION_URL = 'https://bas-payload.young-wave-770a.workers.dev'

/**
 * Get the full URL for a Payload media item
 * Converts relative URLs to absolute URLs
 */
export function getMediaUrl(media: Media | null | undefined): string | null {
  if (!media?.url) return null

  // If already absolute URL, return as-is
  if (media.url.startsWith('http://') || media.url.startsWith('https://')) {
    return media.url
  }

  // Get base URL from environment or use production default
  const baseUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    (typeof window !== 'undefined' ? window.location.origin : PRODUCTION_URL)

  // Construct full URL
  return `${baseUrl}${media.url}`
}

/**
 * Get media URL from a Media object or ID
 */
export function getImageUrl(
  image: Media | number | string | null | undefined
): string | null {
  if (!image) return null

  // If it's a Media object with url
  if (typeof image === 'object' && 'url' in image) {
    return getMediaUrl(image as Media)
  }

  return null
}
