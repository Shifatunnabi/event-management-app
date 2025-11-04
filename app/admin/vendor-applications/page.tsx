"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Mail, Phone, MapPin, FileText } from "lucide-react"

const applications = [
  {
    id: 1,
    name: "Elite Catering Services",
    category: "Catering",
    email: "contact@elitecatering.com",
    phone: "+1 234-567-8905",
    location: "Boston, MA",
    message: "We specialize in corporate events and weddings with 10+ years of experience.",
    date: "2025-01-20",
    status: "pending",
  },
  {
    id: 2,
    name: "Spotlight Photography",
    category: "Photography",
    email: "info@spotlightphoto.com",
    phone: "+1 234-567-8906",
    location: "Seattle, WA",
    message: "Professional event photography with a creative touch. Portfolio available upon request.",
    date: "2025-01-19",
    status: "pending",
  },
  {
    id: 3,
    name: "Party Rentals Plus",
    category: "Equipment Rental",
    email: "hello@partyrentals.com",
    phone: "+1 234-567-8907",
    location: "Austin, TX",
    message: "Full-service party equipment rental including tents, tables, chairs, and more.",
    date: "2025-01-18",
    status: "pending",
  },
]

export default function VendorApplicationsPage() {
  const [pendingApplications, setPendingApplications] = useState(applications)

  const handleApprove = (id: number) => {
    setPendingApplications(pendingApplications.filter((app) => app.id !== id))
    // In real app, would add to vendors list
  }

  const handleDecline = (id: number) => {
    setPendingApplications(pendingApplications.filter((app) => app.id !== id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Vendor Applications</h1>
        <p className="text-center text-muted-foreground">Review and approve vendor applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Applications</span>
            <Badge variant="secondary">{pendingApplications.length} pending</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending applications</p>
            ) : (
              pendingApplications.map((application) => (
                <Card key={application.id} className="border-2">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{application.name}</h3>
                            <Badge variant="outline">{application.category}</Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {application.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {application.phone}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {application.location}
                          </div>
                          <div className="pt-2">
                            <p className="text-sm text-muted-foreground flex items-start gap-2">
                              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{application.message}</span>
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">Applied on: {application.date}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(application.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button onClick={() => handleDecline(application.id)} variant="destructive">
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
