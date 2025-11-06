"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to create-event for now
    // TODO: Implement edit functionality with pre-filled form
    router.push("/organizer/create-event")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
