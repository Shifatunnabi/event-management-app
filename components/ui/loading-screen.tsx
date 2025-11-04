"use client"

import GeometricLoader from "@/components/geometric-loader"
import Image from "next/image"

const APP_NAME = "EventGhor"

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Image src="/eventghor-logo.png" alt="EventGhor" width={100} height={100} className="h-50 pb-3 w-auto" />
      <GeometricLoader />
      <div className="mb-8 text-4xl font-bold text-[#ff7c07]">{APP_NAME}</div>
      
      <p className="mt-8 text-muted-foreground">Loading amazing events...</p>
    </div>
  )
}
