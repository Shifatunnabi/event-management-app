"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Menu } from "lucide-react"
import OrganizerSidebar from "@/components/organizer/sidebar"
import { Button } from "@/components/ui/button"

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and is an approved organizer or super admin
    if (status === "loading") return

    if (status === "unauthenticated" || !session?.user) {
      router.push("/auth/signin")
      return
    }

    // Allow access for SUPER_ADMIN or approved ORGANIZER
    const isAdmin = session.user.role === "SUPER_ADMIN"
    const isApprovedOrganizer = session.user.role === "ORGANIZER" && session.user.organizerStatus === "APPROVED"

    if (!isAdmin && !isApprovedOrganizer) {
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

  // Don't render protected content until authenticated as approved organizer or super admin
  if (!session?.user) {
    return null
  }

  const isAdmin = session.user.role === "SUPER_ADMIN"
  const isApprovedOrganizer = session.user.role === "ORGANIZER" && session.user.organizerStatus === "APPROVED"

  if (!isAdmin && !isApprovedOrganizer) {
    return null
  }

  return (
    <div className="flex">
      {/* Only show organizer sidebar and menu button for organizers, not for admins */}
      {!isAdmin && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-20 z-50 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <OrganizerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}

      <main className={`min-h-screen w-full ${!isAdmin ? 'lg:ml-64 lg:pr-64' : ''}`}>{children}</main>
    </div>
  )
}
