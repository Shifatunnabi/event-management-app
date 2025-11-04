import { Music, Users, Heart, Gamepad2, Building2, UtensilsCrossed, Ghost } from "lucide-react"

export interface Category {
  id: string
  name: string
  icon: any
  color: string
}

export const categories: Category[] = [
  { id: "halloween", name: "Halloween", icon: Ghost, color: "text-orange-500" },
  { id: "music", name: "Music", icon: Music, color: "text-purple-500" },
  { id: "nightlife", name: "Nightlife", icon: Music, color: "text-pink-500" },
  { id: "performing-arts", name: "Visual Arts", icon: Users, color: "text-blue-500" },
  { id: "dating", name: "Dating", icon: Heart, color: "text-red-500" },
  { id: "hobbies", name: "Hobbies", icon: Gamepad2, color: "text-green-500" },
  { id: "business", name: "Business", icon: Building2, color: "text-indigo-500" },
  { id: "food-drink", name: "Food & Drink", icon: UtensilsCrossed, color: "text-amber-500" },
]
