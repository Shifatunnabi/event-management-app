"use client"

import { useState, useMemo } from "react"
import SearchBar from "@/components/home/search-bar"
import EventFilters from "@/components/home/event-filters"
import EventCard from "@/components/home/event-card"
import { events } from "@/data/events"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import OrganizerCTA from "@/components/organizer-cta"

const EVENTS_PER_PAGE = 9

export default function EventsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "finished">("active")

  const filteredEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedFilter === "active") {
      return events.filter((event) => new Date(event.date) >= today)
    } else if (selectedFilter === "finished") {
      return events.filter((event) => new Date(event.date) < today)
    }
    return events
  }, [selectedFilter])

  const activeCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return events.filter((event) => new Date(event.date) >= today).length
  }, [])

  const finishedCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return events.filter((event) => new Date(event.date) < today).length
  }, [])

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
  const endIndex = startIndex + EVENTS_PER_PAGE
  const currentEvents = filteredEvents.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const handleFilterChange = (filter: "all" | "active" | "finished") => {
    setSelectedFilter(filter)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen">
      <div className="py-8">
        <h1 className="mb-4 text-center text-4xl font-bold">All Events</h1>
        <p className="mb-4 text-center text-md text-black/60">Explore all the events at one place</p>

        {/* Search Section */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Event Filters Section */}
        <div className="mb-6 flex justify-end">
          <EventFilters
            activeCount={activeCount}
            finishedCount={finishedCount}
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="h-10 w-10 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => goToPage(page)}
                  className={`h-10 w-10 ${currentPage === page ? "bg-[#ff7c07] text-white" : ""}`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="h-10 w-10 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Organizer CTA Section */}
        <OrganizerCTA />
      </div>
    </div>
  )
}
