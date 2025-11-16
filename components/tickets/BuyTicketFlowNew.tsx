"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import toast from "react-hot-toast"
import {
  Calendar,
  Clock,
  MapPin,
  Minus,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react"

interface EventData {
  id: string
  slug: string
  title: string
  image: string
  date: string
  time: string
  location: string
  organizerName: string
  ticketTypes: {
    name: string
    price: number
    available: number | null
  }[]
  bkashNumber?: string
}

interface BuyTicketFlowProps {
  event: EventData
  trigger: React.ReactNode
}

type FlowStep =
  | "summary"
  | "quantity"
  | "payment-instructions"
  | "payment-details"
  | "confirmation"

export default function BuyTicketFlowNew({
  event,
  trigger,
}: BuyTicketFlowProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast: toastHook } = useToast()

  const [currentStep, setCurrentStep] = useState<FlowStep | null>(null)
  const [selectedTicketType, setSelectedTicketType] = useState(
    event.ticketTypes[0]
  )
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingExisting, setIsCheckingExisting] = useState(false)

  // Payment details for premium tickets
  const [senderBkashNumber, setSenderBkashNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [reservationId, setReservationId] = useState("")

  const totalAmount = quantity * selectedTicketType.price
  const isFree = selectedTicketType.price === 0
  const availableTickets = selectedTicketType.available || 999

  const handleTriggerClick = async () => {
    if (status === "unauthenticated") {
      toast.error("Please create an account to purchase tickets", {
        duration: 4000,
        position: "top-center",
      })
      const currentPath = window.location.pathname
      router.push(`/auth/signup/user?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    // Check if user already has tickets for this event
    setIsCheckingExisting(true)
    try {
      const response = await fetch(`/api/tickets/check-existing?eventSlug=${event.slug}`)
      const data = await response.json()

      if (data.hasExistingBooking) {
        toast.error("You have already purchased tickets for this event", {
          duration: 4000,
          position: "top-center",
          icon: "🎫",
        })
        return
      }

      setCurrentStep("summary")
    } catch (error) {
      console.error("Error checking existing booking:", error)
      toast.error("Failed to check ticket status. Please try again.", {
        duration: 3000,
        position: "top-center",
      })
    } finally {
      setIsCheckingExisting(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(null)
    setQuantity(1)
    setSenderBkashNumber("")
    setTransactionId("")
    setAgreedToTerms(false)
    setReservationId("")
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1 && newQuantity <= availableTickets) {
      setQuantity(newQuantity)
    }
  }

  // Step 1: Summary -> Quantity
  const handleFromSummaryToQuantity = () => {
    setCurrentStep("quantity")
  }

  // Step 2: Quantity -> Payment Instructions (Premium) or Direct Booking (Free)
  const handleFromQuantityNext = async () => {
    if (isFree) {
      // Free tickets: Book directly
      await handleBookFreeTickets()
    } else {
      // Premium tickets: Show payment instructions
      setCurrentStep("payment-instructions")
    }
  }

  // Step 3: Payment Instructions -> Reserve Tickets
  const handleAgreeAndContinue = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions", {
        duration: 3000,
        position: "top-center",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/tickets/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventSlug: event.slug,
          ticketType: selectedTicketType.name,
          quantity,
          pricePerTicket: selectedTicketType.price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error.includes("already purchased")) {
          toast.error("You have already purchased tickets for this event", {
            duration: 4000,
            position: "top-center",
            icon: "🎫",
          })
          setCurrentStep(null)
          return
        }
        throw new Error(data.error || "Failed to reserve tickets")
      }

      setReservationId(data.reservationId)
      setCurrentStep("payment-details")
      
      toast.success("Tickets Reserved! You have 20 minutes to complete payment", {
        duration: 5000,
        position: "top-center",
        icon: "⏰",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to reserve tickets. Please try again.", {
        duration: 4000,
        position: "top-center",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Step 4: Payment Details -> Submit Payment
  const handleConfirmPurchase = async () => {
    if (!senderBkashNumber || !transactionId) {
      toast.error("Please provide both Bkash number and Transaction ID", {
        duration: 3000,
        position: "top-center",
      })
      return
    }

    if (!agreedToTerms) {
      toast.error("Please confirm that your payment details are correct", {
        duration: 3000,
        position: "top-center",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/tickets/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,
          senderBkashNumber,
          transactionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit payment")
      }

      setCurrentStep("confirmation")
      toast.success(`Successfully purchased ${quantity} ticket(s)`, {
        duration: 5000,
        position: "top-center",
        icon: "🎉",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to submit payment. Please try again.", {
        duration: 4000,
        position: "top-center",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Free Ticket Booking
  const handleBookFreeTickets = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/tickets/book-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventSlug: event.slug,
          ticketType: selectedTicketType.name,
          quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error.includes("already purchased")) {
          toast.error("You have already purchased tickets for this event", {
            duration: 4000,
            position: "top-center",
            icon: "🎫",
          })
          setCurrentStep(null)
          return
        }
        throw new Error(data.error || "Failed to book tickets")
      }

      setCurrentStep("confirmation")
      toast.success(`Successfully booked ${quantity} free ticket(s)`, {
        duration: 5000,
        position: "top-center",
        icon: "🎉",
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to book tickets. Please try again.", {
        duration: 4000,
        position: "top-center",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div onClick={handleTriggerClick} style={{ opacity: isCheckingExisting ? 0.6 : 1, pointerEvents: isCheckingExisting ? "none" : "auto" }}>
        {trigger}
      </div>

      {/* Step 1: Event Summary */}
      <Dialog open={currentStep === "summary"} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Event Summary</DialogTitle>
            <DialogDescription>Review event details before purchasing</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">{event.title}</h3>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Organized by {event.organizerName}</span>
                </div>
              </div>
            </div>

            <Card className="p-4 bg-primary/5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Ticket Price</p>
                <p className="text-3xl font-bold text-primary">
                  {isFree ? "FREE" : `৳${selectedTicketType.price.toFixed(2)}`}
                </p>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleFromSummaryToQuantity} className="flex-1">
                {isFree ? "Get Free Tickets" : "Buy Tickets"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2: Select Quantity */}
      <Dialog open={currentStep === "quantity"} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Quantity</DialogTitle>
            <DialogDescription>
              How many tickets would you like to {isFree ? "book" : "purchase"}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="p-4 bg-primary/5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Ticket Price</p>
                <p className="text-3xl font-bold text-primary">
                  {isFree ? "FREE" : `৳${selectedTicketType.price.toFixed(2)}`}
                </p>
              </div>
            </Card>

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-12 w-12 rounded-full"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <div className="text-center min-w-[100px]">
                <p className="text-4xl font-bold">{quantity}</p>
                <p className="text-sm text-muted-foreground">
                  {quantity === 1 ? "ticket" : "tickets"}
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= availableTickets}
                className="h-12 w-12 rounded-full"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {!isFree && (
              <Card className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ৳{totalAmount.toFixed(2)}
                  </span>
                </div>
              </Card>
            )}

            <p className="text-xs text-center text-muted-foreground">
              {availableTickets === 999 ? "Unlimited tickets available" : `${availableTickets} tickets available`}
            </p>

            <div className="flex gap-2">
              <Button onClick={() => setCurrentStep("summary")} variant="outline" className="flex-1">
                Back
              </Button>
              <Button onClick={handleFromQuantityNext} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isFree ? (
                  `Book ${quantity} Ticket${quantity > 1 ? "s" : ""}`
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 3: Payment Instructions (Premium Only) */}
      <Dialog open={currentStep === "payment-instructions"} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Instructions</DialogTitle>
            <DialogDescription>Please read carefully before proceeding</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4 border-primary bg-primary/5">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Event</span>
                  <span className="text-sm font-semibold">{event.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Number of Tickets</span>
                  <span className="text-sm font-semibold">{quantity}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">৳{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-orange-200 bg-orange-50">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-orange-900">Important Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-orange-800">
                    <li>Send <strong>EXACTLY ৳{totalAmount.toFixed(2)}</strong> to the Bkash number below</li>
                    <li>You have <strong>20 minutes</strong> to complete the payment</li>
                    <li>Save your Bkash number and Transaction ID</li>
                    <li>Tickets will be sent after organizer verification (usually within 24 hours)</li>
                  </ol>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-green-900">Send Money To:</p>
                <p className="text-3xl font-bold text-green-700">{event.bkashNumber}</p>
                <p className="text-xs text-green-600">Organizer's Bkash Number</p>
              </div>
            </Card>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                I understand that I need to send ৳{totalAmount.toFixed(2)} to {event.bkashNumber} within 20 minutes and provide correct payment details in the next step.
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setCurrentStep("quantity")} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleAgreeAndContinue}
                disabled={!agreedToTerms || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reserving...
                  </>
                ) : (
                  "Agree & Continue"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 4: Payment Details (Premium Only) */}
      <Dialog open={currentStep === "payment-details"} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Confirmation</DialogTitle>
            <DialogDescription>Enter your payment details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-3 bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> Make sure you've already sent ৳{totalAmount.toFixed(2)} to {event.bkashNumber} via Bkash before filling this form.
              </p>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="bkash">Your Bkash Number *</Label>
              <Input
                id="bkash"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={senderBkashNumber}
                onChange={(e) => setSenderBkashNumber(e.target.value)}
                pattern="^01[0-9]{9}$"
                maxLength={11}
              />
              <p className="text-xs text-muted-foreground">
                The Bkash number from which you sent the money
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="txn">Transaction ID *</Label>
              <Input
                id="txn"
                type="text"
                placeholder="Enter transaction ID from Bkash SMS"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You received this in the Bkash confirmation SMS
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="confirm"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="confirm" className="text-sm leading-tight cursor-pointer">
                I hereby give surety that the Bkash number and Transaction ID are correct. If wrong, the organizer will not be responsible for this.
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setCurrentStep("payment-instructions")} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleConfirmPurchase}
                disabled={!senderBkashNumber || !transactionId || !agreedToTerms || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 5: Confirmation */}
      <Dialog open={currentStep === "confirmation"} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div>
              <DialogTitle className="text-2xl mb-2">
                {isFree ? "Booking Confirmed!" : "Payment Submitted!"}
              </DialogTitle>
              <DialogDescription className="text-base">
                {isFree ? (
                  <>
                    Your free tickets have been booked successfully.
                    <br />
                    Check your email and dashboard for tickets.
                  </>
                ) : (
                  <>
                    Your booking is now pending organizer verification.
                    <br />
                    You'll receive your tickets via email once approved (usually within 24 hours).
                  </>
                )}
              </DialogDescription>
            </div>

            <Card className="p-4 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-medium">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tickets</span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {isFree ? "FREE" : `৳${totalAmount.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-orange-600">
                    {isFree ? "Confirmed" : "Pending Verification"}
                  </span>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
