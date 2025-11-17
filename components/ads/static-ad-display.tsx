"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

// ⚠️ IMPORTANT: Change this value to adjust rotation interval (in milliseconds)
// Current: 60000ms = 1 minute
const ROTATION_INTERVAL_MS = 60000 // 1 minute

interface StaticAd {
  _id: string
  companyName: string
  ctaLink: string
  posterUrl: string
}

interface StaticAdDisplayProps {
  className?: string
}

export default function StaticAdDisplay({ className = "" }: StaticAdDisplayProps) {
  const [ads, setAds] = useState<StaticAd[]>([])
  const [currentAd, setCurrentAd] = useState<StaticAd | null>(null)

  // Fetch active static ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/admin/static-ads?activeOnly=true")
        const data = await response.json()
        if (data.success && data.ads.length > 0) {
          setAds(data.ads)
          // Set initial random ad
          const randomAd = data.ads[Math.floor(Math.random() * data.ads.length)]
          setCurrentAd(randomAd)
        }
      } catch (error) {
        console.error("Error fetching static ads:", error)
      }
    }

    fetchAds()
  }, [])

  // Rotate ads at interval
  useEffect(() => {
    if (ads.length === 0) return

    const intervalId = setInterval(() => {
      const randomAd = ads[Math.floor(Math.random() * ads.length)]
      setCurrentAd(randomAd)
    }, ROTATION_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [ads])

  const handleAdClick = () => {
    if (currentAd?.ctaLink) {
      window.open(currentAd.ctaLink, "_blank", "noopener,noreferrer")
    }
  }

  if (!currentAd) {
    // Fallback when no ads are available
    return (
      <div className={`${className}`}>
        <div className="relative w-full h-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-4xl md:text-5xl font-bold text-gray-300 mb-2">AD</div>
            <p className="text-sm md:text-base font-semibold text-gray-400">Premium Ad Placement</p>
            <p className="text-xs text-gray-300 mt-1">Available for Advertising</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
      onClick={handleAdClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleAdClick()
        }
      }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-lg shadow-md">
        <Image
          src={currentAd.posterUrl}
          alt={`Advertisement by ${currentAd.companyName}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          Ad
        </div>
      </div>
    </div>
  )
}
