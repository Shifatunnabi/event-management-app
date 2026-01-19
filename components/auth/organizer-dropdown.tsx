"use client"

import { Building2, User, PlusCircle, LayoutDashboard, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrganizerDropdownProps {
  userName: string
  organizationName?: string
  userImage?: string
}

export function OrganizerDropdown({ userName, organizationName, userImage }: OrganizerDropdownProps) {
  console.log("OrganizerDropdown - userImage:", userImage)
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
          <Avatar className="h-9 w-9">
            {userImage ? (
              <AvatarImage src={userImage} alt={userName} className="object-cover" />
            ) : (
              <AvatarFallback className="bg-linear-to-br from-purple-600 to-blue-600 text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {organizationName || "Organizer Account"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            View Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/organizer/create-event" className="cursor-pointer">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/organizer/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Organizer Panel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={() => {
            toast.success("Successfully logged out")
            signOut({ callbackUrl: "/" })
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
