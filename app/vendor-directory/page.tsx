"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import VendorCard from "@/components/vendor/vendor-card"
import ApplyFeatureModal from "@/components/vendor/apply-feature-modal"
import { vendors, vendorCategories } from "@/data/vendors"

export default function VendorDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null)

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
        <div className="container mx-auto max-w-7xl px-4 py-8 md:px-8">
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

          <div className="space-y-4">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  isExpanded={expandedVendorId === vendor.id}
                  onToggle={(id) => setExpandedVendorId(expandedVendorId === id ? null : id)}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No vendors found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplyFeatureModal open={applyModalOpen} onOpenChange={setApplyModalOpen} />
    </>
  )
}
