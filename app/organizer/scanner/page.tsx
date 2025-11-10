"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import {
  QrCode,
  CheckCircle,
  XCircle,
  Camera,
  Loader2,
  User,
  Calendar,
  Ticket as TicketIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ScanResult {
  success: boolean
  message: string
  ticket?: {
    id: string
    status: string
    ticketType: string
    price: number
    attendee: {
      name: string
      email: string
    }
    event?: {
      title: string
      date: string
      time: string
      location: string
    }
    correctEvent?: {
      title: string
      date: string
      location: string
    }
    scannedEvent?: {
      title: string
    }
  }
  alreadyScanned?: boolean
  wrongEvent?: boolean
  wasWrongEvent?: boolean
}

interface Event {
  _id: string
  title: string
}

export default function ScannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [manualTicketId, setManualTicketId] = useState("")
  const [selectedEvent, setSelectedEvent] = useState("")
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({ scanned: 0, valid: 0, invalid: 0 })
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const statsStorageKey = useRef("")
  const readerDivId = "qr-reader"

  // Load stats from localStorage when event changes
  useEffect(() => {
    if (selectedEvent) {
      statsStorageKey.current = `scanner-stats-${selectedEvent}`
      const savedStats = localStorage.getItem(statsStorageKey.current)
      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats))
        } catch (e) {
          setStats({ scanned: 0, valid: 0, invalid: 0 })
        }
      } else {
        setStats({ scanned: 0, valid: 0, invalid: 0 })
      }
    }
  }, [selectedEvent])

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (statsStorageKey.current) {
      localStorage.setItem(statsStorageKey.current, JSON.stringify(stats))
    }
  }, [stats])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated") {
      fetchOrganizerEvents()
    }
  }, [status, router])

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState()
          // Only stop if scanner is actually running
          if (state === 2) { // 2 = SCANNING state
            scannerRef.current
              .stop()
              .then(() => {
                scannerRef.current?.clear()
              })
              .catch(() => {
                // Silently ignore errors during cleanup
              })
          }
        } catch (err) {
          // Silently ignore if we can't check state
        }
      }
    }
  }, [])

  const fetchOrganizerEvents = async () => {
    try {
      const response = await fetch("/api/organizers/events")
      const data = await response.json()
      if (response.ok && data.success) {
        setEvents(data.events || [])
        if (data.events.length > 0) {
          setSelectedEvent(data.events[0]._id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch events:", error)
    }
  }

  const startScanner = async () => {
    if (!selectedEvent) {
      toast({
        title: "No Event Selected",
        description: "Please select an event first",
        variant: "destructive",
      })
      return
    }

    setIsInitializing(true)
    setCameraError(null)
    
    try {
      // First set scanning to true to show the scanner div
      setIsScanning(true)
      
      // Wait a moment for DOM to update
      await new Promise(resolve => setTimeout(resolve, 50))
      
      const html5QrCode = new Html5Qrcode(readerDivId)
      scannerRef.current = html5QrCode

      // Get available cameras
      const devices = await Html5Qrcode.getCameras()
      
      if (!devices || devices.length === 0) {
        throw new Error("No cameras found on this device")
      }

      console.log("Available cameras:", devices)

      // Find back camera or use first available
      let cameraId = devices[0].id
      
      // Try to find environment/back camera
      const backCamera = devices.find(
        (device) =>
          device.label.toLowerCase().includes("back") ||
          device.label.toLowerCase().includes("rear") ||
          device.label.toLowerCase().includes("environment")
      )
      
      if (backCamera) {
        cameraId = backCamera.id
        console.log("Using back camera:", backCamera.label)
      } else {
        console.log("Using default camera:", devices[0].label)
      }

      // Start the scanner with the camera
      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        handleScanError
      )

      console.log("Scanner started successfully")
      setIsInitializing(false)
    } catch (err: any) {
      console.error("Scanner error:", err)
      setIsInitializing(false)
      setIsScanning(false)
      setCameraError(err.message || "Failed to start camera")
      toast({
        title: "Camera Error",
        description: err.message || "Unable to access camera. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState()
        // Only stop if scanner is actually running (state 2 = SCANNING, state 3 = PAUSED)
        if (state === 2 || state === 3) {
          await scannerRef.current.stop()
        }
      } catch (err) {
        console.error("Error stopping scanner:", err)
      } finally {
        // Always clear and reset state
        try {
          if (scannerRef.current) {
            scannerRef.current.clear()
          }
        } catch (e) {
          // Ignore clear errors
        }
        scannerRef.current = null
        setIsScanning(false)
      }
    } else {
      setIsScanning(false)
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
    // Pause scanning while processing
    if (scannerRef.current) {
      try {
        await scannerRef.current.pause(true)
      } catch (e) {
        // Ignore if pause fails
      }
    }

    // Parse QR data
    try {
      const qrPayload = JSON.parse(decodedText)
      await validateTicket(qrPayload.qrData, qrPayload.qrSignature)
    } catch (error) {
      playSound(false)
      setScanResult({
        success: false,
        message: "Invalid QR code format",
      })
      setTimeout(() => setScanResult(null), 5000)
    }

    // Resume scanning after 3 seconds
    setTimeout(() => {
      if (scannerRef.current && isScanning) {
        try {
          scannerRef.current.resume()
        } catch (e) {
          // Ignore if resume fails
        }
      }
    }, 3000)
  }

  const handleScanError = (errorMessage: string) => {
    // Silent - scanning errors are normal when no QR code is visible
  }

  const validateTicket = async (qrData: string, qrSignature: string) => {
    try {
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData,
          qrSignature,
          eventId: selectedEvent || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setScanResult({
          ...data,
          wasWrongEvent: data.wasWrongEvent,
        })
        setStats((prev) => ({
          scanned: prev.scanned + 1,
          valid: prev.valid + 1,
          invalid: prev.invalid,
        }))
        playSound(true)
      } else {
        setScanResult({
          success: false,
          message: data.error || "Ticket validation failed",
          alreadyScanned: data.alreadyScanned,
          wrongEvent: data.wrongEvent,
          ticket: data.ticket,
        })
        setStats((prev) => ({
          scanned: prev.scanned + 1,
          valid: prev.valid,
          invalid: prev.invalid + 1,
        }))
        playSound(false)
      }

      // Show result longer for wrong event errors (8 seconds vs 5 seconds)
      setTimeout(() => setScanResult(null), data.wrongEvent ? 8000 : 5000)
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate ticket",
        variant: "destructive",
      })
    }
  }

  const handleManualValidation = async () => {
    if (!manualTicketId.trim()) return

    // This would need additional API support
    toast({
      title: "Manual Validation",
      description: "Manual ticket ID validation not yet implemented",
    })
  }

  const playSound = (success: boolean) => {
    const audio = new Audio(success ? "/sounds/success.mp3" : "/sounds/error.mp3")
    audio.play().catch(() => {
      // Ignore audio play errors
    })
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl md:text-4xl font-bold">Ticket Scanner</h1>
        <p className="text-muted-foreground">
          Scan attendee tickets for entry verification
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Event Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Event</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Scanner Card */}
        <Card>
          <CardHeader>
            <CardTitle>QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scanner Area */}
            <div className="relative">
              <div
                className={`rounded-lg ${
                  scanResult?.success
                    ? "ring-4 ring-green-500 transition-all duration-300"
                    : scanResult?.success === false
                      ? "ring-4 ring-red-500 transition-all duration-300"
                      : ""
                }`}
              >
                {/* Placeholder - shown when not scanning */}
                {!isScanning && !isInitializing && (
                  <div className="flex aspect-square items-center justify-center rounded-lg border-4 border-dashed border-muted-foreground/25 bg-muted/50">
                    <div className="text-center">
                      <Camera className="mx-auto mb-4 h-16 w-16 md:h-24 md:w-24 text-muted-foreground" />
                      <p className="text-base md:text-lg font-medium text-muted-foreground mb-2">
                        Camera Not Active
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Click "Start Scanner" to begin
                      </p>
                      {cameraError && (
                        <p className="text-xs text-red-500 mt-2">{cameraError}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Initializing state */}
                {isInitializing && (
                  <div className="flex aspect-square items-center justify-center rounded-lg border-4 border-dashed border-primary/25 bg-primary/5">
                    <div className="text-center">
                      <Loader2 className="mx-auto mb-4 h-16 w-16 md:h-24 md:w-24 text-primary animate-spin" />
                      <p className="text-base md:text-lg font-medium text-primary mb-2">
                        Starting Camera...
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Please allow camera permissions
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Scanner div - always in DOM */}
                <div 
                  id={readerDivId}
                  className={`${isScanning && !isInitializing ? "block" : "hidden"}`}
                />
              </div>
            </div>

            {/* Scan Result */}
            {scanResult && (
              <div
                className={`rounded-lg p-4 ${
                  scanResult.success
                    ? scanResult.wasWrongEvent
                      ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border-2 border-yellow-400"
                      : "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100"
                    : scanResult.wrongEvent
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 border-2 border-orange-400"
                      : "bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.success ? (
                    <CheckCircle className="h-6 w-6 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-6 w-6 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{scanResult.message}</p>
                    
                    {/* Warning for previously wrong event scan */}
                    {scanResult.wasWrongEvent && (
                      <p className="text-sm mt-1 font-medium bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
                        ⚠️ Note: This ticket was previously scanned at the wrong event. Now validated correctly.
                      </p>
                    )}
                    
                    {/* Already scanned status */}
                    {scanResult.alreadyScanned && (
                      <p className="text-sm mt-1 font-medium">
                        Status: Already Scanned Ticket
                      </p>
                    )}
                    
                    {/* Wrong event details */}
                    {scanResult.wrongEvent && scanResult.ticket && (
                      <div className="text-sm mt-2 p-3 bg-orange-100 dark:bg-orange-900/40 rounded space-y-2">
                        <p className="font-bold">⚠️ WRONG EVENT SCAN</p>
                        <div className="space-y-1">
                          <p><strong>This ticket is for:</strong></p>
                          <div className="pl-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{scanResult.ticket.correctEvent?.title}</span>
                            </div>
                            <p className="text-xs">📍 {scanResult.ticket.correctEvent?.location}</p>
                            <p className="text-xs">📅 {new Date(scanResult.ticket.correctEvent?.date || "").toLocaleDateString()}</p>
                          </div>
                          
                        </div>
                      </div>
                    )}
                    
                    {/* Valid ticket details */}
                    {scanResult.ticket && !scanResult.wrongEvent && (
                      <div className="text-sm space-y-1 mt-2">
                        {scanResult.ticket.attendee?.name && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{scanResult.ticket.attendee.name}</span>
                          </div>
                        )}
                        {scanResult.ticket.ticketType && scanResult.ticket.price !== undefined && (
                          <div className="flex items-center gap-2">
                            <TicketIcon className="h-4 w-4" />
                            <span>
                              {scanResult.ticket.ticketType} - ৳
                              {scanResult.ticket.price.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {scanResult.ticket.event?.title && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{scanResult.ticket.event.title}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scanner Controls */}
            <div className="flex gap-2">
              {!isScanning ? (
                <Button
                  onClick={startScanner}
                  className="flex-1 bg-[#ff7c07] hover:bg-[#e66f06] text-white"
                  size="lg"
                  disabled={!selectedEvent || isInitializing}
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Starting Camera...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-5 w-5" />
                      Start Scanner
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={stopScanner}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  Stop Scanner
                </Button>
              )}
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <Label htmlFor="manualTicket">Manual Ticket ID</Label>
              <div className="flex gap-2">
                <Input
                  id="manualTicket"
                  placeholder="Enter ticket ID manually"
                  value={manualTicketId}
                  onChange={(e) => setManualTicketId(e.target.value)}
                />
                <Button onClick={handleManualValidation} variant="outline">
                  Validate
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 rounded-lg border p-4">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold">{stats.scanned}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Scanned</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-green-600">
                  {stats.valid}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Valid</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-red-600">
                  {stats.invalid}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">Invalid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
