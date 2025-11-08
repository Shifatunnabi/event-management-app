"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, UserCheck, Users, Store, FileText, ImageIcon, LogOut, Calendar } from "lucide-react"
import { adminLogout } from "@/lib/admin-auth"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/organizer-approval", label: "Organizer Approval", icon: UserCheck },
  { href: "/admin/organizer-management", label: "Organizer Management", icon: Users },
  { href: "/admin/event-management", label: "Event Management", icon: Calendar },
  { href: "/admin/vendor-management", label: "Vendor Directory", icon: Store },
  { href: "/admin/vendor-applications", label: "Vendor Applications", icon: FileText },
  { href: "/admin/featured-posters", label: "Featured Posters", icon: ImageIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    adminLogout()
    router.push("/admin/signin")
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-4rem)] flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600 mt-1">Super Admin Control</p>
        <div className="pt-2 border-gray-200">
          <Button onClick={handleLogout} variant="outline" className="w-full justify-center gap-3 bg-red-500 text-white">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
      </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                isActive ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      
    </aside>
  )
}
