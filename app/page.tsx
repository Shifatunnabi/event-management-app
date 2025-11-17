"use client"

import HeroSlider from "@/components/home/hero-slider"
import EventOrganizerCard from "@/components/home/event-organizer-card"
import CategoryBadges from "@/components/home/category-badges"
import EventCard from "@/components/home/event-card"
import FAQSection from "@/components/home/faq-section"
import WhyEventGhor from "@/components/home/why-eventghor"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import OrganizerCTA from "@/components/organizer-cta"
import Advertisement from "@/components/home/advertisement"
import SearchBar from "@/components/home/search-bar"
import EventFilters from "@/components/home/event-filters"
import BreakoutSection from "@/components/layout/breakout-section"
import { useState, useMemo, useEffect } from "react"
import AdPlaceholder from "@/components/ui/ad-placeholder"
import StaticAdDisplay from "@/components/ads/static-ad-display"

interface Event {
  id: string
  title: string
  image: string
  date: string
  location: string
  price: number | "Free"
  category: string
  organizer: string
  description: string
  attendees: number
  isFeatured?: boolean
}

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "finished">("active")
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/events?upcoming=true&limit=15")
        const data = await response.json()

        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedFilter === "active") {
      return events.filter((event) => new Date(event.date) >= today)
    } else if (selectedFilter === "finished") {
      return events.filter((event) => new Date(event.date) < today)
    }
    return events
  }, [selectedFilter, events])

  const activeCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return events.filter((event) => new Date(event.date) >= today).length
  }, [events])

  const finishedCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return events.filter((event) => new Date(event.date) < today).length
  }, [events])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-8">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-4">
          {/* Hero Slider - full width on mobile, 3 cols on desktop */}
          <div className="h-[200px] md:h-[250px] lg:h-[400px] lg:col-span-3">
            <HeroSlider />
          </div>

          {/* Event Organizer Card - full width on mobile, 1 col on desktop */}
          <div className="h-[180px] md:h-[250px] lg:h-[400px] lg:col-span-1">
            <EventOrganizerCard />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <BreakoutSection className="py-8 bg-black/10 overflow-hidden">
        <CategoryBadges />
      </BreakoutSection>

      {/* Upcoming Events Section */}
      <section className="py-12">
        <h2 className="mb-4 text-center text-3xl font-bold">Explore Upcoming Events</h2>
        <p className="mb-8 text-center text-md text-black/60">Explore all the events at one place</p>

        <div className="mb-12">
          <SearchBar />
        </div>

        <div className="mb-6 flex justify-end">
          <EventFilters
            activeCount={activeCount}
            finishedCount={finishedCount}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.slice(0, 15).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No upcoming events found</p>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link href="/events">
            <Button
              size="lg"
              className="group bg-[#ff7c07] hover:bg-[#e66f06] text-white px-8"
            >
              View All Events
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

       {/* Static Ad Space After Events */}
      <div className="mb-12">
        <StaticAdDisplay className="w-full h-[250px] md:h-[300px]" />
      </div>

      <BreakoutSection className="bg-gray-200/30">
        {/* <div className="container mx-auto px-4 py-8">
          <Advertisement />
        </div> */}

        <WhyEventGhor />
      </BreakoutSection>

      {/* FAQ Section */}
      <FAQSection />

      {/*Organizer CTA Section*/}
      <div className="py-8">
        <OrganizerCTA />
      </div>
    </div>
  )
}
