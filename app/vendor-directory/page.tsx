"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import VendorCard from "@/components/vendor/vendor-card"
import ApplyFeatureModal from "@/components/vendor/apply-feature-modal"
import { useToast } from "@/hooks/use-toast"

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

const vendorCategories = [
  "All Categories",
  "Catering",
  "Photography",
  "Decoration",
  "Audio/Visual",
  "Entertainment",
  "Planning",
  "Others",
]

export default function VendorDirectoryPage() {
  const { toast } = useToast()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null)

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/vendors/apply")
      const data = await response.json()

      if (data.success) {
        setVendors(data.vendors)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || vendor.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <div className="min-h-screen">
        <div className="py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex-1 text-center">
              <h1 className="mb-2 text-4xl font-bold">Vendor Directory</h1>
              <p className="text-muted-foreground">Find trusted professionals for your event</p>
            </div>
            <Button onClick={() => setApplyModalOpen(true)} className="bg-[#ff7c07] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Apply to be Featured
            </Button>
          </div>

          <div className="mx-auto mb-8 max-w-3xl space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search vendors by name or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {vendorCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? "bg-[#ff7c07] text-white" : "bg-transparent"}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <VendorCard
                    key={vendor._id}
                    vendor={vendor}
                    isExpanded={expandedVendorId === vendor._id}
                    onToggle={(id) => setExpandedVendorId(expandedVendorId === id ? null : id)}
                  />
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {vendors.length === 0
                      ? "No vendors available at the moment. Be the first to apply!"
                      : "No vendors found matching your criteria"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ApplyFeatureModal open={applyModalOpen} onOpenChange={setApplyModalOpen} onSuccess={fetchVendors} />
    </>
  )
}
