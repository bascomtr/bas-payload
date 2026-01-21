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
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => {
        const bgImage = slide.backgroundImage as Media | undefined
        const isActive = index === currentSlide

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-[600ms] ${
              isActive ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            aria-hidden={!isActive}
          >
            {/* Background Image */}
            {bgImage?.url ? (
              <Image
                src={bgImage.url}
                alt={bgImage.alt || slide.heading || ''}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-linear-to-br from-secondary to-primary" />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-secondary/85 via-primary-dark/60 to-primary/40" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center z-10">
              <div className="container">
                <div className="max-w-3xl text-white">
                  {slide.heading && (
                    <h1 
                      className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 drop-shadow-md ${
                        isActive ? 'animate-slide-up' : ''
                      }`}
                    >
                      {slide.heading}
                    </h1>
                  )}
                  {slide.subheading && (
                    <p 
                      className={`text-lg md:text-xl opacity-95 mb-8 max-w-2xl leading-relaxed ${
                        isActive ? 'animate-slide-up animation-delay-200' : ''
                      }`}
                    >
                      {slide.subheading}
                    </p>
                  )}
                  {slide.buttonLabel && slide.buttonLink && (
                    <div className={`flex flex-wrap gap-4 ${isActive ? 'animate-slide-up animation-delay-300' : ''}`}>
                      <Link
                        href={slide.buttonLink.startsWith('/') ? slide.buttonLink : `/${locale}${slide.buttonLink}`}
                        className="btn btn-primary btn-lg"
                      >
                        {slide.buttonLabel}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                      <Link href={getLocalePath(locale, '/hakkimizda')} className="btn btn-outline btn-lg">
                        Daha Fazla Bilgi
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-12 h-1 rounded-full overflow-hidden transition-all ${
                index === currentSlide ? 'bg-white/50' : 'bg-white/30'
              }`}
              aria-label={`Slayt ${index + 1}'e git`}
            >
              {index === currentSlide && (
                <span className="block h-full bg-primary rounded-full animate-progress" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-primary hover:border-primary transition-all z-20"
            aria-label="Önceki slayt"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-primary hover:border-primary transition-all z-20"
            aria-label="Sonraki slayt"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Scroll Down Indicator */}
      <div className="hidden md:flex absolute bottom-8 right-8 flex-col items-center gap-2 text-white text-xs uppercase tracking-wider z-20">
        <span>Keşfet</span>
        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
