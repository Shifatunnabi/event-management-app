"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, Clock, CheckCircle, TrendingUp, Store, FileText, Briefcase, Loader2 } from "lucide-react"

interface DashboardStats {
  totalEvents: number
  totalOrganizers: number
  pendingOrganizerApprovals: number
  pastEvents: number
  totalVendors: number
  vendorApplications: number
  upcomingEvents: number
  totalJobs: number
}

export default function AdminDashboard() {
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
      const response = await fetch("/api/admin/dashboard/stats", {
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

  const statsConfig = [
    { 
      title: "Total Events", 
      value: stats?.totalEvents || 0, 
      icon: Calendar, 
      color: "text-blue-600", 
      bgColor: "bg-blue-100" 
    },
    { 
      title: "Total Organizers", 
      value: stats?.totalOrganizers || 0, 
      icon: Users, 
      color: "text-green-600", 
      bgColor: "bg-green-100" 
    },
    { 
      title: "Pending Organizer Approvals", 
      value: stats?.pendingOrganizerApprovals || 0, 
      icon: Clock, 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-100" 
    },
    { 
      title: "Past Events", 
      value: stats?.pastEvents || 0, 
      icon: CheckCircle, 
      color: "text-purple-600", 
      bgColor: "bg-purple-100" 
    },
    { 
      title: "Total Vendors", 
      value: stats?.totalVendors || 0, 
      icon: Store, 
      color: "text-pink-600", 
      bgColor: "bg-pink-100" 
    },
    { 
      title: "Vendor Applications", 
      value: stats?.vendorApplications || 0, 
      icon: FileText, 
      color: "text-orange-600", 
      bgColor: "bg-orange-100" 
    },
    { 
      title: "Upcoming Events", 
      value: stats?.upcomingEvents || 0, 
      icon: TrendingUp, 
      color: "text-indigo-600", 
      bgColor: "bg-indigo-100" 
    },
    { 
      title: "Total Jobs Posted", 
      value: stats?.totalJobs || 0, 
      icon: Briefcase, 
      color: "text-teal-600", 
      bgColor: "bg-teal-100" 
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Admin Dashboard</h1>
        <p className="text-center text-muted-foreground">Overview of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
    </div>
  )
}
