export interface UserTicket {
  id: string
  eventId: string
  eventTitle: string
  eventImage: string
  eventDate: string
  eventLocation: string
  ticketType: string
  qrCode: string
  purchaseDate: string
  price: number | "Free"
}

export const userTickets: UserTicket[] = [
  {
    id: "T001",
    eventId: "1",
    eventTitle: "NEON COUNTDOWN 2025",
    eventImage: "/images/events/neon-countdown.jpg",
    eventDate: "2025-12-30",
    eventLocation: "Bangkok, Thailand",
    ticketType: "VIP Pass",
    qrCode: "/placeholder.svg?height=200&width=200",
    purchaseDate: "2025-10-15",
    price: 2500,
  },
  {
    id: "T002",
    eventId: "3",
    eventTitle: "Food & Wine Festival",
    eventImage: "/images/events/food-festival.jpg",
    eventDate: "2025-11-20",
    eventLocation: "Phuket, Thailand",
    ticketType: "General Admission",
    qrCode: "/placeholder.svg?height=200&width=200",
    purchaseDate: "2025-10-20",
    price: "Free",
  },
  {
    id: "T003",
    eventId: "5",
    eventTitle: "Jazz Under The Stars",
    eventImage: "/images/events/jazz-concert.jpg",
    eventDate: "2025-11-25",
    eventLocation: "Chiang Mai, Thailand",
    ticketType: "Standard",
    qrCode: "/placeholder.svg?height=200&width=200",
    purchaseDate: "2025-10-22",
    price: 800,
  },
]
