"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Menu } from "lucide-react"
import OrganizerSidebar from "@/components/organizer/sidebar"
import BannedOrganizerMessage from "@/components/organizer/banned-message"
import { Button } from "@/components/ui/button"

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and is an approved organizer
    if (status === "loading") return

    if (status === "unauthenticated" || !session?.user) {
      const currentPath = window.location.pathname
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    if (session.user.role !== "ORGANIZER") {
      router.push("/")
      return
    }

    if (session.user.organizerStatus !== "APPROVED") {
      router.push("/")
      return
    }
  }, [pathname, router, session, status])

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // Don't render protected content until authenticated as approved organizer
  if (!session?.user || session.user.role !== "ORGANIZER" || session.user.organizerStatus !== "APPROVED") {
    return null
  }

  // Check if organizer is banned
  const isBanned = (session.user as any).isBanned || false

  return (
    <div className="flex">
      {!isBanned && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-20 z-50 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {!isBanned && <OrganizerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <main className={`min-h-screen w-full ${!isBanned ? 'lg:ml-64 lg:pr-64' : ''}`}>
        {isBanned ? <BannedOrganizerMessage /> : children}
      </main>
    </div>
  )
}
