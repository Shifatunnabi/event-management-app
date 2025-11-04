"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface EventFiltersProps {
  activeCount?: number
  finishedCount?: number
  selectedFilter?: "all" | "active" | "finished"
  onFilterChange?: (filter: "all" | "active" | "finished") => void
}

export default function EventFilters({
  activeCount = 0,
  finishedCount = 0,
  selectedFilter = "active",
  onFilterChange,
}: EventFiltersProps) {
  const handleFilterClick = (filter: "all" | "active" | "finished") => {
    onFilterChange?.(filter)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Create Event Button */}
      <Button className="bg-[#ff7c07] hover:bg-[#e66f06] text-white">
        <Plus className="mr-2 h-4 w-4" />
        Create Event
      </Button>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleFilterClick("active")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            selectedFilter === "active"
              ? "bg-white border border-gray-200 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Active
          <Badge
            className={`${
              selectedFilter === "active" ? "bg-amber-500 hover:bg-amber-500" : "bg-amber-500/80 hover:bg-amber-500/80"
            } text-white`}
          >
            {activeCount}
          </Badge>
        </button>

        <button
          onClick={() => handleFilterClick("finished")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            selectedFilter === "finished"
              ? "bg-white border border-gray-200 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Finished
          <Badge
            className={`${
              selectedFilter === "finished"
                ? "bg-amber-500 hover:bg-amber-500"
                : "bg-amber-500/80 hover:bg-amber-500/80"
            } text-white`}
          >
            {finishedCount}
          </Badge>
        </button>

        <button
          onClick={() => handleFilterClick("all")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
            selectedFilter === "all" ? "bg-white border border-gray-200 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All
        </button>
      </div>
    </div>
  )
}
