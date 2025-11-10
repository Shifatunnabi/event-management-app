"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Home, Calendar, Briefcase, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MobileNav() {
  const pathname = usePathname()
  const { status } = useSession()
  const isAuthenticated = status === "authenticated"

  const baseNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/events", icon: Calendar, label: "Events" },
    { href: "/vendor-directory", icon: Users, label: "Vendors" },
    { href: "/jobs", icon: Briefcase, label: "Jobs" },
  ]

  const navItems = isAuthenticated
    ? [...baseNavItems, { href: "/dashboard", icon: User, label: "Profile" }]
    : baseNavItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive ? "text-[#ff7c07]" : "text-gray-600 hover:text-gray-900",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
