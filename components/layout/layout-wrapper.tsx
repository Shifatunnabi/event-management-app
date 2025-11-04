"use client"

import { usePathname } from "next/navigation"
import MainContainer from "./main-container"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  // Check if we're on admin or organizer routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/organizer')) {
    return <>{children}</>
  }
  
  return <MainContainer>{children}</MainContainer>
}