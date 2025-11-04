"use client"

import { useState } from "react"
import { Search, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")

  const handleSearch = () => {
    console.log("[v0] Search:", { searchQuery, location, date })
  }

  return (
    <div className="mx-auto max-w-5xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 border-0 bg-transparent pl-10 text-base focus-visible:ring-0"
          />
        </div>

        {/* Location Input */}
        <div className="relative border-l-0 md:border-l md:border-gray-200">
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 md:left-6" />
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-12 border-0 bg-transparent pl-10 text-base focus-visible:ring-0 md:pl-12"
          />
        </div>

        {/* Date Input */}
        <div className="relative border-l-0 md:border-l md:border-gray-200">
          <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 md:left-6" />
          <Input
            type="text"
            placeholder="Any date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onFocus={(e) => (e.target.type = "date")}
            onBlur={(e) => {
              if (!e.target.value) e.target.type = "text"
            }}
            className="h-12 border-0 bg-transparent pl-10 text-base focus-visible:ring-0 md:pl-12"
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="mt-4 flex justify-center">
        <Button
          onClick={handleSearch}
          className="h-12 bg-[#ff7c07] px-8 text-base font-medium text-white hover:bg-[#e66f06]"
        >
          <Search className="mr-2 h-5 w-5" />
          Search Events
        </Button>
      </div>
    </div>
  )
}
