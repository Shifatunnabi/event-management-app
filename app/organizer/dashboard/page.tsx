"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, Calendar, TrendingUp, ListChecks, CalendarDays, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UpcomingEvent {
  title: string
  date: string
  attendees: number
}

interface DashboardStats {
  totalListedEvents: number
  totalActiveEvents: number
  totalTicketSales: number
  totalAttendees: number
  totalRevenue: number
  joinDate: string
  upcomingEvents: UpcomingEvent[]
}

export default function OrganizerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/organizers/dashboard/stats", {
        cache: 'no-store'
      })
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
        console.log("Stats updated:", data.stats)
      } else {
        console.error("Failed to fetch stats:", data.error)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const statsConfig = [
    { 
      title: "Total Listed Events", 
      value: stats?.totalListedEvents || 0, 
      icon: ListChecks, 
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    { 
      title: "Active Events", 
      value: stats?.totalActiveEvents || 0, 
      icon: Calendar, 
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    { 
      title: "Total Ticket Sales", 
      value: stats?.totalTicketSales || 0, 
      icon: TrendingUp, 
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    { 
      title: "Total Attendees", 
      value: stats?.totalAttendees || 0, 
      icon: Users, 
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    { 
      title: "Total Revenue", 
      value: `৳${(stats?.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    },
    { 
      title: "Member Since", 
      value: stats?.joinDate ? formatDate(stats.joinDate) : "N/A", 
      icon: CalendarDays, 
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl md:text-4xl text-center font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground text-center">Welcome back! Here's what's happening with your events.</p>
      </div>
      
      {/* Stats Grid - 3x2 */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsConfig.map((stat) => {
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

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {stats.upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{event.attendees} attendees</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No upcoming events</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
