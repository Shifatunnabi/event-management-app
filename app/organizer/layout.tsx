"use client"

import type React from "react"
import { useState } from "react"
import { Menu } from "lucide-react"
import OrganizerSidebar from "@/components/organizer/sidebar"
import { Button } from "@/components/ui/button"

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex">
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-20 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <OrganizerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen w-full lg:ml-64 lg:pr-64">{children}</main>
    </div>
  )
}
