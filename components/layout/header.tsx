"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { UserDropdown } from "@/components/auth/user-dropdown"
import { OrganizerDropdown } from "@/components/auth/organizer-dropdown"
import { Settings } from "lucide-react"

const APP_NAME = "EventGhor"

export default function Header() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { data: session, status } = useSession()

  const isAuthenticated = status === "authenticated"
  const user = session?.user

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        // Scrolling up or at top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <>
      {/* Desktop Capsule Navbar */}
      <header
        className={cn(
          "fixed top-4 left-1/2 z-50 hidden w-[62.5%] -translate-x-1/2 transition-all duration-300 lg:block",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0",
        )}
      >
        <nav className="flex items-center rounded-full border border-gray-200 bg-red-300/20 px-4 py-2 shadow-lg backdrop-blur-sm">
          <div className="shrink-0">
            <Link href="/" className="flex h-10 items-center justify-center transition-transform hover:scale-110">
              <Image src="/eventghor-logo.png" alt="EventGhor" width={40} height={40} className="h-13 pb-1 w-auto" />
            </Link>
          </div>

          {/* Navigation Items - Center */}
          <div className="flex flex-1 items-center justify-center gap-1">
            <Link href="/">
              <Button variant="ghost" className="rounded-full text-sm">
                Home
              </Button>
            </Link>
            <Link href="/events">
              <Button variant="ghost" className="rounded-full text-sm">
                Events
              </Button>
            </Link>
            <Link href="/vendor-directory">
              <Button variant="ghost" className="rounded-full text-sm">
                Vendors
              </Button>
            </Link>
            <Link href="/jobs">
              <Button variant="ghost" className="rounded-full text-sm">
                Jobs
              </Button>
            </Link>
            {isAuthenticated && (
              <Link href="/dashboard">
                <Button variant="ghost" className="rounded-full text-sm">
                  Profile
                </Button>
              </Link>
            )}
          </div>

          {/* Auth Actions - Right */}
          <div className="flex shrink-0 items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" className="rounded-full text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#ff7c07] hover:bg-[#e66f06] rounded-full text-sm text-white">
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* Super Admin Settings */}
                {user?.role === "SUPER_ADMIN" && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full" title="Admin Panel">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </Link>
                )}

                {/* User Dropdown or Organizer Dropdown */}
                {user?.role === "ORGANIZER" && user?.organizerStatus === "APPROVED" ? (
                  <OrganizerDropdown userName={user.name || ""} organizationName={user.organizationName} />
                ) : user?.role === "USER" || user?.role === "SUPER_ADMIN" ? (
                  <UserDropdown userName={user.name || ""} />
                ) : null}
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Top Bar - No changes */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-all duration-300 lg:hidden",
          isVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex h-10 items-center">
            <Image src="/eventghor-logo.png" alt="EventGhor" width={40} height={40} className="h-10 w-auto" />
          </Link>

          {/* Auth Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="rounded-full text-xs">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#ff7c07] hover:bg-[#e66f06] rounded-full text-xs text-white" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {/* Super Admin Settings */}
                {user?.role === "SUPER_ADMIN" && (
                  <Link href="/admin/dashboard">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" title="Admin Panel">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {/* User Dropdown or Organizer Dropdown */}
                {user?.role === "ORGANIZER" && user?.organizerStatus === "APPROVED" ? (
                  <OrganizerDropdown userName={user.name || ""} organizationName={user.organizationName} />
                ) : user?.role === "USER" || user?.role === "SUPER_ADMIN" ? (
                  <UserDropdown userName={user.name || ""} />
                ) : null}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
