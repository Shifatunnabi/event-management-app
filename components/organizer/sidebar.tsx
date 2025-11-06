"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { LayoutDashboard, PlusCircle, Users, QrCode, Briefcase, LogOut, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@radix-ui/react-separator"

const sidebarItems = [
  { href: "/organizer/dashboard", icon: LayoutDashboard, label: "Dashboard Overview" },
  { href: "/organizer/create-event", icon: PlusCircle, label: "Create Event" },
  { href: "/organizer/events", icon: Calendar, label: "Event Management" },
  { href: "/organizer/attendees", icon: Users, label: "Attendee Management" },
  { href: "/organizer/scanner", icon: QrCode, label: "Ticket Scanner" },
  { href: "/organizer/jobs", icon: Briefcase, label: "Jobs Board" },
]

interface OrganizerSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function OrganizerSidebar({ isOpen = true, onClose }: OrganizerSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleLinkClick = () => {
    if (onClose) onClose()
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 lg:sticky lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col gap-2 p-4">
          <div className="mb-4 border-b border-gray-300">
            <h2 className="text-lg font-bold whitespace-nowrap">Organizer Panel</h2>
            <p className="text-sm text-muted-foreground whitespace-nowrap mb-4">Manage your events</p>
            
            {/* <div className="pt-2 border-gray-200">
              <Button onClick={handleLogout} variant="outline" className="w-full justify-center gap-3 bg-red-500 text-white">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Button>
            </div> */}
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-[#ff7c07] hover:bg-[#e66f06] text-white"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          
        </div>
      </aside>
    </>
  )
}
