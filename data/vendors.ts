export interface Vendor {
  id: string
  name: string
  serviceName: string
  category: string
  rating: number
  reviewCount: number
  photo: string
  phone: string
  email: string
  description: string
  priceRange: string
  location: string
  services?: string[]
  organizationName?: string
  workLinks?: { label: string; url: string }[]
  portfolioImages?: string[]
}

export const vendors: Vendor[] = [
  {
    id: "V001",
    name: "Sarah Johnson",
    serviceName: "Elegant Moments",
    category: "Photographer",
    rating: 4.9,
    reviewCount: 127,
    photo: "/images/vendors/photographer.jpg", // Updated to use generated image
    phone: "+1 234 567 8900",
    email: "sarah@elegantmoments.com",
    description: "Professional event photographer with 10+ years of experience capturing unforgettable moments.",
    priceRange: "$$$ - Premium",
    location: "Bangkok, Thailand",
  },
  {
    id: "V002",
    name: "Michael Chen",
    serviceName: "CineVision Studios",
    category: "Cinematographer",
    rating: 4.8,
    reviewCount: 95,
    photo: "/images/vendors/cinematographer.jpg", // Updated to use generated image
    phone: "+1 234 567 8901",
    email: "michael@cinevision.com",
    description: "Award-winning cinematographer specializing in event videography and documentary-style coverage.",
    priceRange: "$$$$ - Luxury",
    location: "Singapore",
  },
  {
    id: "V003",
    name: "Emily Rodriguez",
    serviceName: "Gourmet Delights Catering",
    category: "Caterer",
    rating: 4.7,
    reviewCount: 203,
    photo: "/images/vendors/caterer.jpg", // Updated to use generated image
    phone: "+1 234 567 8902",
    email: "emily@gourmetdelights.com",
    description: "Full-service catering company offering diverse menus for events of all sizes.",
    priceRange: "$$ - Moderate",
    location: "Kuala Lumpur, Malaysia",
  },
  {
    id: "V004",
    name: "David Park",
    serviceName: "Dreamscape Decorators",
    category: "Decorator",
    rating: 4.9,
    reviewCount: 156,
    photo: "/images/vendors/decorator.jpg", // Updated to use generated image
    phone: "+1 234 567 8903",
    email: "david@dreamscape.com",
    description: "Creative event decorator transforming venues into magical spaces with stunning designs.",
    priceRange: "$$$ - Premium",
    location: "Manila, Philippines",
  },
  {
    id: "V005",
    name: "Lisa Thompson",
    serviceName: "Harmony Sound Systems",
    category: "Audio/Visual",
    rating: 4.8,
    reviewCount: 89,
    photo: "/images/vendors/audio-visual.jpg", // Updated to use generated image
    phone: "+1 234 567 8904",
    email: "lisa@harmonysound.com",
    description: "Professional audio and visual equipment rental with expert technical support.",
    priceRange: "$$ - Moderate",
    location: "Jakarta, Indonesia",
  },
  {
    id: "V006",
    name: "James Wilson",
    serviceName: "EventFlow Coordinators",
    category: "Event Planner",
    rating: 5.0,
    reviewCount: 178,
    photo: "/images/vendors/event-planner.jpg", // Updated to use generated image
    phone: "+1 234 567 8905",
    email: "james@eventflow.com",
    description: "Full-service event planning and coordination for corporate and private events.",
    priceRange: "$$$$ - Luxury",
    location: "Hong Kong",
  },
  {
    id: "V007",
    name: "Maria Garcia",
    serviceName: "Sweet Celebrations Bakery",
    category: "Bakery",
    rating: 4.9,
    reviewCount: 234,
    photo: "/images/vendors/bakery.jpg", // Updated to use generated image
    phone: "+1 234 567 8906",
    email: "maria@sweetcelebrations.com",
    description: "Custom cakes and desserts for all occasions, made with premium ingredients.",
    priceRange: "$$ - Moderate",
    location: "Bangkok, Thailand",
  },
  {
    id: "V008",
    name: "Robert Kim",
    serviceName: "Spotlight Entertainment",
    category: "Entertainment",
    rating: 4.7,
    reviewCount: 112,
    photo: "/images/vendors/entertainment.jpg", // Updated to use generated image
    phone: "+1 234 567 8907",
    email: "robert@spotlightent.com",
    description: "Professional entertainers including DJs, bands, and performers for any event.",
    priceRange: "$$$ - Premium",
    location: "Singapore",
  },
  {
    id: "V009",
    name: "Amanda Lee",
    serviceName: "Floral Dreams",
    category: "Florist",
    rating: 4.8,
    reviewCount: 145,
    photo: "/images/vendors/florist.jpg", // Updated to use generated image
    phone: "+1 234 567 8908",
    email: "amanda@floraldreams.com",
    description: "Exquisite floral arrangements and decorations for weddings and special events.",
    priceRange: "$$ - Moderate",
    location: "Phuket, Thailand",
  },
]

export const vendorCategories = [
  "All Categories",
  "Photographer",
  "Cinematographer",
  "Caterer",
  "Decorator",
  "Audio/Visual",
  "Event Planner",
  "Bakery",
  "Entertainment",
  "Florist",
]
