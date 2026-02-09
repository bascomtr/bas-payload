'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface GalleryImage {
  url: string
  alt: string
}

interface ProductGalleryProps {
  images: GalleryImage[]
  productTitle: string
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const activeImage = images[activeIndex]

  const goToPrevious = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') setIsLightboxOpen(false)
    },
    [goToPrevious, goToNext],
  )

  if (images.length === 0) return null

  return (
    <div className="product-gallery" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Main Image */}
      <div
        className="gallery-main"
        onClick={() => setIsLightboxOpen(true)}
        role="button"
        tabIndex={0}
        aria-label={`${productTitle} - Görsel ${activeIndex + 1}/${images.length}`}
      >
        <div className="gallery-main-inner">
          <Image
            src={activeImage.url}
            alt={activeImage.alt || productTitle}
            fill
            className="gallery-main-img"
            priority={activeIndex === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Zoom hint */}
        <div className="gallery-zoom-hint">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
      </div>

      {/* Thumbnail Grid (WooCommerce style - 4 columns) */}
      {images.length > 1 && (
        <div className="gallery-grid">
          {images.map((image, index) => (
            <button
              key={index}
              className={`gallery-grid-item ${index === activeIndex ? 'gallery-grid-item-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Görsel ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productTitle} ${index + 1}`}
                fill
                className="gallery-grid-img"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="gallery-lightbox"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Görsel büyütme"
        >
          <div className="gallery-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productTitle}
              fill
              className="gallery-lightbox-img"
              sizes="100vw"
              quality={90}
            />

            {/* Lightbox navigation */}
            {images.length > 1 && (
              <>
                <button
                  className="gallery-lightbox-nav gallery-lightbox-prev"
                  onClick={goToPrevious}
                  aria-label="Önceki görsel"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  className="gallery-lightbox-nav gallery-lightbox-next"
                  onClick={goToNext}
                  aria-label="Sonraki görsel"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Counter */}
            <div className="gallery-lightbox-counter">
              {activeIndex + 1} / {images.length}
            </div>
          </div>

          {/* Close button */}
          <button
            className="gallery-lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Kapat"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
