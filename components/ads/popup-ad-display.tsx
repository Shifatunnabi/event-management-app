"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

// ⚠️ IMPORTANT: Change this value to adjust popup interval (in milliseconds)
// Current: 180000ms = 3 minutes
const POPUP_INTERVAL_MS = 180000 // 3 minutes

interface PopupAd {
  _id: string
  companyName: string
  description: string
  ctaLink: string
  ctaButton: string
  posterUrl: string
}

export default function PopupAdDisplay() {
  const [ads, setAds] = useState<PopupAd[]>([])
  const [currentAd, setCurrentAd] = useState<PopupAd | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [shownAds, setShownAds] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  // Fetch active popup ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/admin/popup-ads?activeOnly=true")
        const data = await response.json()
        if (data.success && data.ads.length > 0) {
          setAds(data.ads)
        }
      } catch (error) {
        console.error("Error fetching popup ads:", error)
      }
    }

    fetchAds()
  }, [])

  // Show popup when pathname changes
  useEffect(() => {
    if (ads.length === 0) return

    // Get a random ad that hasn't been shown yet
    const availableAds = ads.filter(ad => !shownAds.has(ad._id))
    
    // If all ads have been shown, reset the shown ads set
    if (availableAds.length === 0) {
      setShownAds(new Set())
      const randomAd = ads[Math.floor(Math.random() * ads.length)]
      setCurrentAd(randomAd)
      setIsVisible(true)
      setShownAds(new Set([randomAd._id]))
    } else {
      const randomAd = availableAds[Math.floor(Math.random() * availableAds.length)]
      setCurrentAd(randomAd)
      setIsVisible(true)
      setShownAds(prev => new Set([...prev, randomAd._id]))
    }
  }, [pathname, ads])

  // Show popup at interval
  useEffect(() => {
    if (ads.length === 0) return

    const intervalId = setInterval(() => {
      // Get a random ad that hasn't been shown yet
      const availableAds = ads.filter(ad => !shownAds.has(ad._id))
      
      // If all ads have been shown, reset the shown ads set
      if (availableAds.length === 0) {
        setShownAds(new Set())
        const randomAd = ads[Math.floor(Math.random() * ads.length)]
        setCurrentAd(randomAd)
        setIsVisible(true)
        setShownAds(new Set([randomAd._id]))
      } else {
        const randomAd = availableAds[Math.floor(Math.random() * availableAds.length)]
        setCurrentAd(randomAd)
        setIsVisible(true)
        setShownAds(prev => new Set([...prev, randomAd._id]))
      }
    }, POPUP_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [ads, shownAds])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleCtaClick = () => {
    if (currentAd?.ctaLink) {
      window.open(currentAd.ctaLink, "_blank", "noopener,noreferrer")
      setIsVisible(false)
    }
  }

  if (!isVisible || !currentAd) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-200"
        onClick={handleClose}
      />
      
      {/* Popup Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
        <Card className="relative w-full max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>

          <CardContent className="p-0">
            <div className="flex flex-col">
              {/* Poster Image */}
              <div className="relative w-full aspect-[4/3]">
                <Image
                  src={currentAd.posterUrl}
                  alt={currentAd.companyName}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Content */}
              <div className="px-4 space-y-2">
                <h2 className="text-lg md:text-xl font-bold my-2 text-gray-900">
                  {currentAd.companyName}
                </h2>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  {currentAd.description}
                </p>
                <Button
                  onClick={handleCtaClick}
                  size="default"
                  className="w-full md:w-auto bg-[#ff7c07] hover:bg-[#e66f06] text-white font-semibold"
                >
                  {currentAd.ctaButton}
                </Button>

            
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
