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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  qrCodeType?: string
  ticket?: {
    id: string
    status: string
    ticketType: string
    price: number
    qrCodeType?: string
    attendee: {
      name: string
      email: string
      phone?: string
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
    allQRCodes?: Array<{
      type: string
      scanned: boolean
      scannedAt?: Date
    }>
  }
  alreadyScanned?: boolean
  wrongEvent?: boolean
  wrongQRType?: boolean
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
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [manualTicketId, setManualTicketId] = useState("")
  const [selectedEvent, setSelectedEvent] = useState("")
  const [selectedQRType, setSelectedQRType] = useState("entry")
  const [events, setEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({ scanned: 0, valid: 0, invalid: 0 })
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  // Use ref to avoid stale closure in scanner callback
  const selectedQRTypeRef = useRef(selectedQRType)
  const selectedEventRef = useRef(selectedEvent)
  
  const qrTypes = [
    { value: "entry", label: "Entry" },
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "snacks", label: "Snacks" },
    { value: "dinner", label: "Dinner" },
    { value: "gifts", label: "Gifts" },
  ]
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const statsStorageKey = useRef("")
  const readerDivId = "qr-reader"

  // Keep refs in sync with state to avoid stale closure issues
  useEffect(() => {
    selectedQRTypeRef.current = selectedQRType
  }, [selectedQRType])

  useEffect(() => {
    selectedEventRef.current = selectedEvent
  }, [selectedEvent])

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

  const handleCloseResultDialog = () => {
    setShowResultDialog(false)
    setScanResult(null)
    // Auto-restart scanner after closing dialog
    if (isScanning) {
      setTimeout(() => {
        if (scannerRef.current) {
          try {
            scannerRef.current.resume()
          } catch (e) {
            // Ignore if resume fails
          }
        }
      }, 100)
    }
  }

  const restartScanner = async () => {
    await stopScanner()
    setTimeout(() => {
      startScanner()
    }, 300)
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentPath = window.location.pathname
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
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
        duration: 2000,
      })
      return
    }
    
    if (!selectedQRType) {
      toast({
        title: "No QR Type Selected",
        description: "Please select a QR type first",
        variant: "destructive",
        duration: 2000,
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
        (device: any) =>
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
        duration: 2000,
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
      setShowResultDialog(true)
    }
  }

  const handleScanError = (errorMessage: string) => {
    // Silent - scanning errors are normal when no QR code is visible
  }

  const validateTicket = async (qrData: string, qrSignature: string) => {
    try {
      // Use ref values to get the latest selected QR type and event
      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrData,
          qrSignature,
          eventId: selectedEventRef.current || undefined,
          expectedQRType: selectedQRTypeRef.current,
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
          wrongQRType: data.wrongQRType,
          qrCodeType: data.qrCodeType,
          ticket: data.ticket,
        })
        setStats((prev) => ({
          scanned: prev.scanned + 1,
          valid: prev.valid,
          invalid: prev.invalid + 1,
        }))
        playSound(false)
      }

      setShowResultDialog(true)
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Failed to validate ticket",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const handleManualValidation = async () => {
    if (!manualTicketId.trim()) return

    // This would need additional API support
    toast({
      title: "Manual Validation",
      description: "Manual ticket ID validation not yet implemented",
      duration: 2000,
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
          Select event and QR type, then scan tickets
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Event & QR Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Scanner Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="event-select" className="mb-2 block">Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger id="event-select">
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
            </div>
            
            <div>
              <Label htmlFor="qr-type-select" className="mb-2 block">QR Type to Scan</Label>
              <Select value={selectedQRType} onValueChange={setSelectedQRType}>
                <SelectTrigger id="qr-type-select">
                  <SelectValue placeholder="Select QR type" />
                </SelectTrigger>
                <SelectContent>
                  {qrTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <QrCode className="h-5 w-5 text-primary" />
              <div className="text-sm">
                <p className="font-medium">Scanning: <span className="text-primary">{qrTypes.find(t => t.value === selectedQRType)?.label}</span></p>
                <p className="text-xs text-muted-foreground">Only {selectedQRType} QR codes will be validated</p>
              </div>
            </div>
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
                <>
                  <Button
                    onClick={stopScanner}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    Stop Scanner
                  </Button>
                  <Button
                    onClick={restartScanner}
                    variant="outline"
                    size="lg"
                  >
                    Restart
                  </Button>
                </>
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

      {/* Scan Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={handleCloseResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {scanResult?.success ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <span className="text-green-600">SUCCESS</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="h-16 w-16 text-red-500" />
                  <span className="text-red-600">
                    {scanResult?.alreadyScanned && "ALREADY SCANNED"}
                    {scanResult?.wrongEvent && "WRONG EVENT"}
                    {scanResult?.wrongQRType && "WRONG QR TYPE"}
                    {!scanResult?.alreadyScanned && !scanResult?.wrongEvent && !scanResult?.wrongQRType && "FAILED"}
                  </span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Attendee Name */}
            {scanResult?.ticket?.attendee?.name && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Attendee</p>
                <p className="text-lg font-semibold">{scanResult.ticket.attendee.name}</p>
              </div>
            )}

            {/* QR Type Badge */}
            {scanResult?.qrCodeType && (
              <div className="flex justify-center">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                  scanResult.success 
                    ? "bg-green-500 text-white" 
                    : "bg-red-500 text-white"
                }`}>
                  {scanResult.qrCodeType.toUpperCase()}
                </div>
              </div>
            )}

            {/* Error Details */}
            {!scanResult?.success && (
              <div className="text-center space-y-2">
                {scanResult?.wrongEvent && scanResult?.ticket?.correctEvent?.title && (
                  <p className="text-sm text-muted-foreground">
                    This ticket is for: <span className="font-semibold">{scanResult.ticket.correctEvent.title}</span>
                  </p>
                )}
                {scanResult?.wrongQRType && (
                  <p className="text-sm text-muted-foreground">
                    Expected: <span className="font-semibold">{selectedQRTypeRef.current.toUpperCase()}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleCloseResultDialog} className="px-8">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
