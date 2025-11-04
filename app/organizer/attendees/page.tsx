"use client"

import { useState } from "react"
import { Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Attendee {
  id: string
  name: string
  email: string
  ticketType: string
  purchaseDate: string
  status: "Confirmed" | "Pending" | "Cancelled"
}

const attendees: Attendee[] = [
  {
    id: "A001",
    name: "John Doe",
    email: "john@example.com",
    ticketType: "VIP",
    purchaseDate: "2025-10-15",
    status: "Confirmed",
  },
  {
    id: "A002",
    name: "Jane Smith",
    email: "jane@example.com",
    ticketType: "General",
    purchaseDate: "2025-10-16",
    status: "Confirmed",
  },
  {
    id: "A003",
    name: "Mike Johnson",
    email: "mike@example.com",
    ticketType: "VIP",
    purchaseDate: "2025-10-17",
    status: "Pending",
  },
  {
    id: "A004",
    name: "Sarah Williams",
    email: "sarah@example.com",
    ticketType: "General",
    purchaseDate: "2025-10-18",
    status: "Confirmed",
  },
  {
    id: "A005",
    name: "David Brown",
    email: "david@example.com",
    ticketType: "VIP",
    purchaseDate: "2025-10-19",
    status: "Cancelled",
  },
]

export default function AttendeesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        
          <h1 className="mb-2 text-2xl md:text-4xl text-center font-bold">Attendee Management</h1>
          <p className="text-muted-foreground text-center">Manage and track your event attendees</p>
        
        
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search attendees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Name</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Email</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Ticket Type</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Purchase Date</th>
                  <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="border-b last:border-0">
                    <td className="py-4 text-sm">{attendee.id}</td>
                    <td className="py-4 text-sm font-medium">{attendee.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{attendee.email}</td>
                    <td className="py-4 text-sm">
                      <Badge variant="secondary">{attendee.ticketType}</Badge>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{attendee.purchaseDate}</td>
                    <td className="py-4 text-sm">
                      <Badge
                        variant={
                          attendee.status === "Confirmed"
                            ? "default"
                            : attendee.status === "Pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {attendee.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
