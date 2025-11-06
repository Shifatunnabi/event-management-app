"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (pathname === "/admin/signin") {
      return
    }

    // Check if user is authenticated and is super admin
    if (status === "loading") return

    if (status === "unauthenticated" || !session?.user) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "SUPER_ADMIN") {
      router.push("/")
      return
    }
  }, [pathname, router, session, status])

  // Show loading while checking authentication
  if (pathname !== "/admin/signin" && status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (pathname === "/admin/signin") {
    return <>{children}</>
  }

  // Don't render protected content until authenticated as super admin
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-50 lg:hidden bg-transparent"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Sidebar - Mobile */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-16 bottom-0 z-50 lg:hidden">
            <AdminSidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 p-4 md:p-8 lg:pr-64">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
