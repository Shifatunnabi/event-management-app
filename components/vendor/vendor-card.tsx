"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronDown, Phone, Mail, MapPin, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Vendor } from "@/data/vendors"

interface VendorCardProps {
  vendor: Vendor
  isExpanded: boolean
  onToggle: (id: string) => void
}

export default function VendorCard({ vendor, isExpanded, onToggle }: VendorCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node) && isExpanded) {
        onToggle(vendor.id)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded, onToggle, vendor.id])

  const services = ["Event Photography", "Portrait Sessions", "Photo Editing", "Album Design"]
  const organizationName = "Elegant Moments LLC"
  const workLinks = [
    { label: "Portfolio Website", url: "https://example.com" },
    { label: "Instagram", url: "https://instagram.com" },
  ]
  const portfolioImages = Array.from(
    { length: 10 },
    (_, i) => `/placeholder.svg?height=200&width=200&query=portfolio${i + 1}`,
  )

  return (
    <Card ref={cardRef} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex cursor-pointer items-center gap-3 p-1 md:gap-4 md:p-2" onClick={() => onToggle(vendor.id)}>
          {/* Photo on the left - smaller on mobile */}
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg md:h-24 md:w-24">
            <Image src={vendor.photo || "/placeholder.svg"} alt={vendor.name} fill className="object-cover" />
          </div>

          {/* Vendor info in the middle - stacked vertically */}
          <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1">
            <h3 className="text-base font-bold leading-tight md:text-xl">{vendor.serviceName}</h3>
            <p className="truncate text-xs text-muted-foreground md:text-sm">{vendor.category}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <Phone className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
              <span className="truncate">{vendor.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <Mail className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
              <span className="truncate">{vendor.email}</span>
            </div>
          </div>

          {/* Dropdown button on the right */}
          <div className="flex-shrink-0">
            <button
              className={`rounded-full border border-border p-1.5 transition-transform duration-300 hover:bg-accent md:p-2 ${
                isExpanded ? "rotate-180" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(vendor.id)
              }}
            >
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        {/* Expanded content - unchanged */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-6 border-t border-border p-2 md:p-3">
            {/* Services, Organization, Links, Details */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold">Services</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {services.map((service, index) => (
                    <li key={index}>• {service}</li>
                  ))}
                </ul>
                <h4 className="mb-2 mt-4 font-semibold">Price Range</h4>
                <Badge variant="secondary">{vendor.priceRange}</Badge>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Organization</h4>
                <p className="text-sm text-muted-foreground">{organizationName}</p>

                <h4 className="mb-2 mt-4 font-semibold">Location</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Work Links</h4>
              <div className="flex flex-wrap gap-2">
                {workLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Details</h4>
              <p className="text-sm text-muted-foreground">{vendor.description}</p>
            </div>

            {/* Horizontal line separator */}
            <hr className="border-border" />

            {/* Portfolio Section */}
            <div>
              <h4 className="mb-4 font-semibold">Portfolio</h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {portfolioImages.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Portfolio ${index + 1}`}
                      fill
                      className="object-cover transition-transform hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
