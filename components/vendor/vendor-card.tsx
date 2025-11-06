"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronDown, Phone, Mail, MapPin, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Vendor {
  _id: string
  name: string
  photo?: string
  serviceName: string
  category: string
  phone: string
  email: string
  location: string
  priceRange: string
  organizationName?: string
  services: string[]
  description: string
  workLinks: { label: string; url: string }[]
  portfolioImages: string[]
}

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
        onToggle(vendor._id)
      }
    }

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isExpanded, onToggle, vendor._id])

  return (
    <Card ref={cardRef} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="flex cursor-pointer items-center gap-3 p-1 md:gap-4 md:p-2" onClick={() => onToggle(vendor._id)}>
          {/* Photo on the left - smaller on mobile */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg md:h-24 md:w-24">
            <Image src={vendor.photo || "/placeholder.svg"} alt={vendor.name} fill className="object-cover" />
          </div>

          {/* Vendor info in the middle - stacked vertically */}
          <div className="min-w-0 flex-1 space-y-0.5 md:space-y-1">
            <h3 className="text-base font-bold leading-tight md:text-xl">{vendor.name}</h3>
            <p className="truncate text-xs text-muted-foreground md:text-sm">{vendor.serviceName}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <Phone className="h-3 w-3 shrink-0 md:h-4 md:w-4" />
              <span className="truncate">{vendor.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground md:gap-2 md:text-sm">
              <Mail className="h-3 w-3 shrink-0 md:h-4 md:w-4" />
              <span className="truncate">{vendor.email}</span>
            </div>
          </div>

          {/* Dropdown button on the right */}
          <div className="shrink-0">
            <button
              className={`rounded-full border border-border p-1.5 transition-transform duration-300 hover:bg-accent md:p-2 ${
                isExpanded ? "rotate-180" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(vendor._id)
              }}
            >
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        {/* Expanded content */}
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
                {vendor.services && vendor.services.length > 0 ? (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {vendor.services.map((service, index) => (
                      <li key={index}>• {service}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No services listed</p>
                )}
                <h4 className="mb-2 mt-4 font-semibold">Price Range</h4>
                <Badge variant="secondary">{vendor.priceRange}</Badge>
              </div>

              <div>
                {vendor.organizationName && (
                  <>
                    <h4 className="mb-2 font-semibold">Organization</h4>
                    <p className="text-sm text-muted-foreground">{vendor.organizationName}</p>
                  </>
                )}

                <h4 className={`mb-2 font-semibold ${vendor.organizationName ? "mt-4" : ""}`}>Location</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.location}</span>
                </div>
              </div>
            </div>

            {vendor.workLinks && vendor.workLinks.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold">Work Links</h4>
                <div className="flex flex-wrap gap-2">
                  {vendor.workLinks.map((link, index) => (
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
            )}

            <div>
              <h4 className="mb-2 font-semibold">Details</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{vendor.description}</p>
            </div>

            {/* Horizontal line separator */}
            {vendor.portfolioImages && vendor.portfolioImages.length > 0 && <hr className="border-border" />}

            {/* Portfolio Section */}
            {vendor.portfolioImages && vendor.portfolioImages.length > 0 && (
              <div>
                <h4 className="mb-4 font-semibold">Portfolio</h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {vendor.portfolioImages.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        fill
                        className="object-cover transition-transform hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

