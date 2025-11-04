"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Phone, Calendar } from "lucide-react"

const pendingRequests = [
  {
    id: 1,
    name: "Alex Thompson",
    email: "alex@events.com",
    phone: "+1 234-567-8901",
    company: "Thompson Events",
    date: "2025-01-15",
    status: "pending",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@celebrations.com",
    phone: "+1 234-567-8902",
    company: "Celebrations Co",
    date: "2025-01-14",
    status: "pending",
  },
  {
    id: 3,
    name: "David Lee",
    email: "david@eventpro.com",
    phone: "+1 234-567-8903",
    company: "EventPro Solutions",
    date: "2025-01-13",
    status: "pending",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@gatherings.com",
    phone: "+1 234-567-8904",
    company: "Gatherings Inc",
    date: "2025-01-12",
    status: "pending",
  },
]

const approvedOrganizers = [
  { id: 5, name: "John Smith", email: "john@events.com", company: "Smith Events", approvedDate: "2025-01-10" },
  { id: 6, name: "Sarah Johnson", email: "sarah@eventify.com", company: "Eventify", approvedDate: "2025-01-08" },
  {
    id: 7,
    name: "Mike Brown",
    email: "mike@celebrations.com",
    company: "Brown Celebrations",
    approvedDate: "2025-01-05",
  },
]

export default function OrganizerApprovalPage() {
  const [requests, setRequests] = useState(pendingRequests)
  const [approved, setApproved] = useState(approvedOrganizers)

  const handleApprove = (id: number) => {
    const request = requests.find((r) => r.id === id)
    if (request) {
      setApproved([
        ...approved,
        {
          id: request.id,
          name: request.name,
          email: request.email,
          company: request.company,
          approvedDate: new Date().toISOString().split("T")[0],
        },
      ])
      setRequests(requests.filter((r) => r.id !== id))
    }
  }

  const handleDecline = (id: number) => {
    setRequests(requests.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Organizer Approval</h1>
        <p className="text-center text-muted-foreground">Review and approve organizer requests</p>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Requests</span>
            <Badge variant="secondary">{requests.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending requests</p>
            ) : (
              requests.map((request) => (
                <Card key={request.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <h3 className="text-lg font-semibold">{request.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{request.company}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {request.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {request.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {request.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleApprove(request.id)} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button onClick={() => handleDecline(request.id)} variant="destructive">
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approved Organizers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Approved Organizers</span>
            <Badge className="bg-green-600">{approved.length} approved</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Approved Date</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((organizer) => (
                  <tr key={organizer.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{organizer.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{organizer.company}</td>
                    <td className="py-3 px-4 text-muted-foreground">{organizer.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">{organizer.approvedDate}</td>
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
