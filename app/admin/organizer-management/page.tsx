"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Mail, Building, Search, MoreVertical } from "lucide-react"
import { useState } from "react"

const organizers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@events.com",
    company: "Smith Events",
    events: 12,
    joinDate: "2024-06-15",
    status: "active",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@eventify.com",
    company: "Eventify",
    events: 8,
    joinDate: "2024-07-20",
    status: "active",
  },
  {
    id: 3,
    name: "Mike Brown",
    email: "mike@celebrations.com",
    company: "Brown Celebrations",
    events: 15,
    joinDate: "2024-05-10",
    status: "active",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@gatherings.com",
    company: "Gatherings Pro",
    events: 6,
    joinDate: "2024-08-05",
    status: "active",
  },
  {
    id: 5,
    name: "Chris Wilson",
    email: "chris@eventpro.com",
    company: "EventPro Solutions",
    events: 10,
    joinDate: "2024-04-22",
    status: "active",
  },
  {
    id: 6,
    name: "Lisa Anderson",
    email: "lisa@celebrations.com",
    company: "Anderson Events",
    events: 4,
    joinDate: "2024-09-12",
    status: "active",
  },
]

export default function OrganizerManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrganizers = organizers.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalEvents = organizers.reduce((sum, org) => sum + org.events, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Organizer Management</h1>
        <p className="text-center text-muted-foreground">Manage all event organizers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Organizers</p>
                <p className="text-3xl font-bold">{organizers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Listed Events</p>
                <p className="text-3xl font-bold">{totalEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Events/Organizer</p>
                <p className="text-3xl font-bold">{(totalEvents / organizers.length).toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizers List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Organizers</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search organizers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizers.map((organizer) => (
              <Card key={organizer.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{organizer.name}</h3>
                        <Badge className="bg-green-600">{organizer.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {organizer.company}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {organizer.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined: {organizer.joinDate}
                        </span>
                      </div>
                      <div className="pt-2">
                        <Badge variant="secondary">{organizer.events} Events Listed</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
