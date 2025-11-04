"use client"

import type React from "react"

import { useEffect, useState } from "react"
import LoadingScreen from "@/components/ui/loading-screen"

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      const fadeOutTimer = setTimeout(() => {
        setShouldShow(false)
      }, 300) // Wait for fade-out animation to complete

      return () => clearTimeout(fadeOutTimer)
    }
  }, [isLoading])

  if (!shouldShow) {
    return <>{children}</>
  }

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isLoading ? "opacity-100" : "opacity-0"}`}>
        <LoadingScreen />
      </div>
      <div className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}>{children}</div>
    </>
  )
}
