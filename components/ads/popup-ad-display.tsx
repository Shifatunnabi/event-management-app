"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const SESSION_KEY = "popup-ad-shown"

interface PopupAd {
  _id: string
  companyName: string
  description: string
  ctaLink: string
  ctaButton: string
  posterUrl: string
}

export default function PopupAdDisplay() {
  const [currentAd, setCurrentAd] = useState<PopupAd | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch and show once per session
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    const fetchAds = async () => {
      try {
        const response = await fetch("/api/admin/popup-ads?activeOnly=true")
        const data = await response.json()
        if (data.success && data.ads.length > 0) {
          const randomAd = data.ads[Math.floor(Math.random() * data.ads.length)]
          setCurrentAd(randomAd)
          setIsVisible(true)
          sessionStorage.setItem(SESSION_KEY, "1")
        }
      } catch (error) {
        console.error("Error fetching popup ads:", error)
      }
    }

    fetchAds()
  }, [])

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
