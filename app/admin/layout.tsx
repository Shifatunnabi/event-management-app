"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      if (pathname === "/admin/signin") {
        setIsLoading(false)
        return
      }

      const authenticated = isAdminAuthenticated()
      if (!authenticated) {
        router.push("/admin/signin")
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router])

  if (isLoading) {
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

  if (!isAuthenticated) {
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
