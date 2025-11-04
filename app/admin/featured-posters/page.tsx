"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Eye } from "lucide-react"
import Image from "next/image"

const initialPosters = [
  {
    id: 1,
    title: "Summer Music Festival",
    imageUrl: "/summer-music-festival.png",
    uploadDate: "2025-01-15",
    active: true,
  },
  {
    id: 2,
    title: "Tech Conference 2025",
    imageUrl: "/tech-conference.png",
    uploadDate: "2025-01-10",
    active: true,
  },
  { id: 3, title: "Food & Wine Expo", imageUrl: "/food-wine-expo.png", uploadDate: "2025-01-05", active: false },
]

export default function FeaturedPostersPage() {
  const [posters, setPosters] = useState(initialPosters)
  const [newPosterTitle, setNewPosterTitle] = useState("")

  const handleUpload = () => {
    if (newPosterTitle) {
      const newPoster = {
        id: posters.length + 1,
        title: newPosterTitle,
        imageUrl: `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(newPosterTitle)}`,
        uploadDate: new Date().toISOString().split("T")[0],
        active: true,
      }
      setPosters([newPoster, ...posters])
      setNewPosterTitle("")
    }
  }

  const handleDelete = (id: number) => {
    setPosters(posters.filter((p) => p.id !== id))
  }

  const toggleActive = (id: number) => {
    setPosters(posters.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">Featured Poster Management</h1>
        <p className="text-center text-muted-foreground">Manage hero slider posters</p>
      </div>

      {/* Upload New Poster */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Poster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poster-title">Poster Title</Label>
              <Input
                id="poster-title"
                placeholder="Enter poster title"
                value={newPosterTitle}
                onChange={(e) => setNewPosterTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="poster-file">Poster Image</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-purple-600 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB (Recommended: 1920x600px)</p>
                <Input id="poster-file" type="file" className="hidden" accept="image/*" />
              </div>
            </div>
            <Button onClick={handleUpload} className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
              <Upload className="w-4 h-4 mr-2" />
              Upload Poster
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Posters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Posters</span>
            <Badge variant="secondary">{posters.filter((p) => p.active).length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posters.map((poster) => (
              <Card key={poster.id} className="border-2">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="relative aspect-[2/1] rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={poster.imageUrl || "/placeholder.svg"}
                        alt={poster.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{poster.title}</h3>
                        <Badge variant={poster.active ? "default" : "secondary"}>
                          {poster.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Uploaded: {poster.uploadDate}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => toggleActive(poster.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {poster.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(poster.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
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
