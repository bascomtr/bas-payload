'use client'

import { useState } from 'react'

interface YouTubeVideoProps {
  videoId: string
  title?: string
}

export function YouTubeVideo({ videoId, title }: YouTubeVideoProps) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="pd-video-card pd-video-card-playing">
        <div className="pd-video-thumb">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {title && <p className="pd-video-title">{title}</p>}
      </div>
    )
  }

  return (
    <button
      className="pd-video-card"
      onClick={() => setPlaying(true)}
      aria-label={title ? `Oynat: ${title}` : 'Videoyu oynat'}
    >
      <div className="pd-video-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt={title || 'Video thumbnail'}
          loading="lazy"
        />
        <div className="pd-video-play">
          <svg viewBox="0 0 68 48" width="68" height="48">
            <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00"/>
            <path d="M45 24L27 14v20" fill="#fff"/>
          </svg>
        </div>
      </div>
      {title && <p className="pd-video-title">{title}</p>}
    </button>
  )
}
