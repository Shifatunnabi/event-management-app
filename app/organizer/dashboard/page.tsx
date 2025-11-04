import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrganizerDashboardPage() {
  const stats = [
    { title: "Total Revenue", value: "$45,231", icon: DollarSign, change: "+20.1%" },
    { title: "Total Attendees", value: "23,456", icon: Users, change: "+15.3%" },
    { title: "Active Events", value: "12", icon: Calendar, change: "+3" },
    { title: "Ticket Sales", value: "8,234", icon: TrendingUp, change: "+12.5%" },
  ]

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        
          <h1 className="mb-2 text-2xl md:text-4xl text-center font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground text-center">Welcome back! Here's what's happening with your events.</p>
        
        
      </div>
      
      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">{stat.change} from last month</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Ticket Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">NEON COUNTDOWN 2025</p>
                    <p className="text-sm text-muted-foreground">VIP Ticket - 2 sold</p>
                  </div>
                  <span className="font-semibold text-purple-600">$5,000</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">Tech Summit 2025</p>
                    <p className="text-sm text-muted-foreground">Nov 15, 2025</p>
                  </div>
                  <span className="text-sm text-muted-foreground">234 attendees</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
