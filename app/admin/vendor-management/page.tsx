"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const initialVendors = [
  {
    id: 1,
    name: "Sound Masters",
    category: "Audio/Visual",
    email: "info@soundmasters.com",
    phone: "+1 234-567-8901",
    location: "New York, NY",
    featured: true,
  },
  {
    id: 2,
    name: "Delicious Catering",
    category: "Catering",
    email: "contact@deliciouscatering.com",
    phone: "+1 234-567-8902",
    location: "Los Angeles, CA",
    featured: false,
  },
  {
    id: 3,
    name: "Event Decor Pro",
    category: "Decoration",
    email: "hello@eventdecor.com",
    phone: "+1 234-567-8903",
    location: "Chicago, IL",
    featured: true,
  },
  {
    id: 4,
    name: "Photo Perfect",
    category: "Photography",
    email: "info@photoperfect.com",
    phone: "+1 234-567-8904",
    location: "Miami, FL",
    featured: false,
  },
]

export default function VendorManagementPage() {
  const [vendors, setVendors] = useState(initialVendors)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: "",
    category: "",
    email: "",
    phone: "",
    location: "",
  })

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddVendor = () => {
    if (newVendor.name && newVendor.category && newVendor.email) {
      setVendors([
        ...vendors,
        {
          id: vendors.length + 1,
          ...newVendor,
          featured: false,
        },
      ])
      setNewVendor({ name: "", category: "", email: "", phone: "", location: "" })
      setIsAddDialogOpen(false)
    }
  }

  const handleDeleteVendor = (id: number) => {
    setVendors(vendors.filter((v) => v.id !== id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Vendor Directory Management</h1>
        <p className="text-center text-muted-foreground">Manage all vendors in the directory</p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add New Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>Fill in the vendor details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name</Label>
                <Input
                  id="name"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newVendor.category}
                  onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                  placeholder="e.g., Catering, Photography"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  placeholder="vendor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                  placeholder="+1 234-567-8900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newVendor.location}
                  onChange={(e) => setNewVendor({ ...newVendor, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
              <Button onClick={handleAddVendor} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                Add Vendor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Vendors</span>
            <Badge variant="secondary">{filteredVendors.length} vendors</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="border-2">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{vendor.name}</h3>
                        <Badge variant="outline">{vendor.category}</Badge>
                        {vendor.featured && <Badge className="bg-yellow-600">Featured</Badge>}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {vendor.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {vendor.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {vendor.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteVendor(vendor.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
