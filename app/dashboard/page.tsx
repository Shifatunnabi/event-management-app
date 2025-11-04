"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import TicketCard from "@/components/dashboard/ticket-card"
import { userTickets } from "@/data/user-tickets"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTickets = userTickets.filter((ticket) =>
    ticket.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen">
      <div className="py-8">
        <h1 className="mb-8 text-4xl font-bold">My Events</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tickets Grid - 1 column mobile, 2 columns tablet, 3 columns desktop */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">No tickets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
