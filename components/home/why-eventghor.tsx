import { Ticket, Shield, Bell, LayoutDashboard, CreditCard, QrCode } from "lucide-react"

const features = [
  {
    icon: Ticket,
    title: "Easy Event Discovery",
    description:
      "Browse and discover thousands of events across multiple categories, from concerts to conferences, all in one convenient platform.",
  },
  {
    icon: Shield,
    title: "Secure Ticketing",
    description:
      "Purchase tickets with confidence through our secure payment system, ensuring your transactions are safe and your data is protected.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description:
      "Stay updated with real-time notifications about your favorite events, ticket confirmations, and important event changes.",
  },
  {
    icon: LayoutDashboard,
    title: "Organizer Dashboard",
    description:
      "Comprehensive event management tools for organizers to create, manage, and track their events with detailed analytics and insights.",
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Options",
    description:
      "Enjoy flexible payment methods including bKash, Nagad, credit cards, and more, ensuring smooth and convenient transactions.",
  },
  {
    icon: QrCode,
    title: "QR Code Entry",
    description:
      "Experience fast and contactless check-in with our QR code scanning system, eliminating the need for printed tickets.",
  },
]

export default function WhyEventGhor() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why EventGhor?</h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Discover the features that make EventGhor the perfect platform for all your event needs
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="mx-auto mb-6 flex w-fit rounded-xl bg-primary/10 p-4">
                <Icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-center text-xl font-semibold">{feature.title}</h3>
              <p className="text-center text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
