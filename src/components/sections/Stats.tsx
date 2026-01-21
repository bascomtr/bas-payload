'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat {
  value: string
  label: string
}

interface StatsProps {
  heading?: string
  stats: Stat[]
}

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return

    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, start])

  return count
}

function StatItem({ value, label, isVisible }: { value: string; label: string; isVisible: boolean }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10)
  const suffix = value.replace(/[0-9]/g, '')
  
  const count = useCountUp(numericValue, 2000, isVisible)

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-primary leading-none mb-3">
        {count}{suffix}
      </div>
      <div className="text-base text-gray-300 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

export function Stats({ heading, stats }: StatsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  if (!stats || stats.length === 0) return null

  return (
    <section ref={sectionRef} className="stats-section">
      <div className="container">
        {heading && (
          <h2 className="text-center text-2xl font-bold text-white mb-12">{heading}</h2>
        )}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
