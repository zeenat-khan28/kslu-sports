'use client'

import { useState, useEffect } from 'react'

interface HeroCarouselProps {
  images: string[]
}

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Default banner if no images exist
  const displayImages = images.length > 0 ? images : ['/branding/default-hero.jpg']

  useEffect(() => {
    if (displayImages.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(timer)
  }, [displayImages.length])

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden bg-[var(--color-kslu-maroon-dark)]">
      {displayImages.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* We use a regular img tag here because next/image requires configuring remote patterns or exact dimensions if dynamic */}
          <img
            src={src}
            alt={`Gallery slide ${index + 1}`}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      ))}
      
      {/* Overlay gradient for readability of anything placed on top */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent opacity-90" />
      
      {/* Indicator dots */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-10">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[var(--color-kslu-saffron)]' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
