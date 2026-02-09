'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { type Locale, getLocalePath } from '@/i18n/config'
import type { Media } from '@/payload-types'

interface HeroSlide {
  heading?: string | null
  subheading?: string | null
  backgroundImage?: Media | number | null
  buttonLabel?: string | null
  buttonLink?: string | null
}

interface HeroSliderProps {
  slides: HeroSlide[]
  locale: Locale
}

export function HeroSlider({ slides, locale }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToSlide = useCallback((index: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating])

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length)
  }, [currentSlide, slides.length, goToSlide])

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length)
  }, [currentSlide, slides.length, goToSlide])

  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [slides.length, nextSlide])

  if (!slides || slides.length === 0) {
    return (
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="animate-fade-in">Manyetik Separasyon Teknolojilerinde Öncü</h1>
          <p className="animate-fade-in animation-delay-200">
            Cevher zenginleştirme ve metal ayırma çözümlerinde 25+ yıllık deneyim
          </p>
          <div className="animate-fade-in animation-delay-300">
            <Link href={getLocalePath(locale, '/urunler')} className="btn btn-primary btn-lg">
              Ürünlerimizi Keşfedin
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="hero-slider">
      {/* Slides */}
      {slides.map((slide, index) => {
        const bgImage = slide.backgroundImage as Media | undefined
        const isActive = index === currentSlide

        return (
          <div
            key={index}
            className={`hero-slider__slide ${isActive ? 'hero-slider__slide--active' : ''}`}
            aria-hidden={!isActive}
          >
            {/* Background Image */}
            {bgImage?.url ? (
              <Image
                src={bgImage.url}
                alt={bgImage.alt || slide.heading || ''}
                fill
                className="hero-slider__bg"
                priority={index === 0}
                sizes="100vw"
              />
            ) : (
              <div className="hero-slider__bg-fallback" />
            )}

            {/* Overlay */}
            <div className="hero-slider__overlay" />

            {/* Content */}
            <div className="hero-slider__content">
              {slide.heading && (
                <h1 className={`hero-slider__heading ${isActive ? 'animate-slide-up' : ''}`}>
                  {slide.heading}
                </h1>
              )}
              {slide.subheading && (
                <p className={`hero-slider__subheading ${isActive ? 'animate-slide-up animation-delay-200' : ''}`}>
                  {slide.subheading}
                </p>
              )}
              {slide.buttonLabel && slide.buttonLink && (
                <div className={`hero-slider__cta ${isActive ? 'animate-slide-up animation-delay-300' : ''}`}>
                  <Link
                    href={slide.buttonLink.startsWith('/') ? slide.buttonLink : `/${locale}${slide.buttonLink}`}
                    className="hero-slider__btn"
                  >
                    {slide.buttonLabel}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="hero-slider__dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`hero-slider__dot ${index === currentSlide ? 'hero-slider__dot--active' : ''}`}
              aria-label={`Slayt ${index + 1}'e git`}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="hero-slider__arrow hero-slider__arrow--prev" aria-label="Önceki slayt">
            <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
              <path d="M18 2L2 18L18 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={nextSlide} className="hero-slider__arrow hero-slider__arrow--next" aria-label="Sonraki slayt">
            <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
              <path d="M2 2L18 18L2 34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      )}
    </section>
  )
}
