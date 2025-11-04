"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, CheckCircle, XCircle, TrendingUp, Store, FileText } from "lucide-react"

const stats = [
  { title: "Total Events", value: "156", icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-100" },
  { title: "Active Organizers", value: "42", icon: Users, color: "text-green-600", bgColor: "bg-green-100" },
  { title: "Pending Approvals", value: "8", icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { title: "Past Events", value: "89", icon: CheckCircle, color: "text-purple-600", bgColor: "bg-purple-100" },
  { title: "Total Vendors", value: "67", icon: Store, color: "text-pink-600", bgColor: "bg-pink-100" },
  { title: "Vendor Applications", value: "12", icon: FileText, color: "text-orange-600", bgColor: "bg-orange-100" },
  { title: "Upcoming Events", value: "67", icon: TrendingUp, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  { title: "Rejected Requests", value: "5", icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
]

const recentActivity = [
  { action: "New organizer approved", user: "John Smith", time: "2 hours ago" },
  { action: "Event published", user: "Sarah Johnson", time: "4 hours ago" },
  { action: "Vendor application received", user: "Mike Wilson", time: "6 hours ago" },
  { action: "Featured poster uploaded", user: "Admin", time: "1 day ago" },
  { action: "Organizer request declined", user: "Tom Brown", time: "2 days ago" },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Admin Dashboard</h1>
        <p className="text-center text-muted-foreground">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
