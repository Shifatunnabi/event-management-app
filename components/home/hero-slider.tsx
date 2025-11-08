"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroSlide {
  _id: string
  eventName: string
  eventLink: string
  posterUrl: string
  active: boolean
}

export default function HeroSlider() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [])

  const fetchSlides = async () => {
    try {
      const response = await fetch("/api/admin/featured-posters?activeOnly=true")
      const data = await response.json()
      if (data.success && data.posters.length > 0) {
        setSlides(data.posters)
      }
    } catch (error) {
      console.error("Error fetching hero slides:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (isLoading) {
    return (
      <div className="h-full rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="h-full rounded-2xl bg-linear-to-r from-purple-600 to-blue-600 flex items-center justify-center">
        <p className="text-white text-xl font-semibold">No featured events available</p>
      </div>
    )
  }

  return (
    <div className="group relative h-full overflow-hidden rounded-2xl">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <Link href={slide.eventLink} className="block h-full w-full">
              <Image src={slide.posterUrl || "/placeholder.svg"} alt={slide.eventName} fill className="object-cover" />
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-white/30 group-hover:opacity-100 z-10"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          prevSlide()
        }}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-white/30 group-hover:opacity-100 z-10"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          nextSlide()
        }}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setCurrentSlide(index)
            }}
            className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  )
}
