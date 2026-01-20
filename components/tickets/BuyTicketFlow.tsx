"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Minus,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import TicketDisplay from "./TicketDisplay";

interface EventData {
  id: string;
  title: string;
  image: string;
  date: string;
  time: string;
  location: string;
  organizerName: string;
  ticketPrice: number;
  totalTickets?: number;
  ticketsSold?: number;
  reservedTickets?: number;
}

interface BuyTicketFlowProps {
  event: EventData;
  trigger: React.ReactNode;
}

type FlowStep =
  | "confirmation"
  | "quantity"
  | "checkout"
  | "payment"
  | "tickets";

export default function BuyTicketFlow({ event, trigger }: BuyTicketFlowProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<FlowStep | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sessionId, setSessionId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<any[]>([]);

  const totalAmount = quantity * event.ticketPrice;
  const availableTickets =
    (event.totalTickets || 0) -
    (event.ticketsSold || 0) -
    (event.reservedTickets || 0);

  const handleTriggerClick = () => {
    if (status === "unauthenticated") {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase tickets",
        variant: "destructive",
        duration: 2000,
      });
      router.push("/auth/signin");
      return;
    }
    setCurrentStep("confirmation");
  };

  const handleConfirm = () => {
    setCurrentStep("quantity");
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= availableTickets) {
      setQuantity(newQuantity);
    }
  };

  const handleProceedToCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tickets/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reserve tickets");
      }

      setSessionId(data.sessionId);
      setExpiresAt(data.expiresAt);
      setCurrentStep("checkout");
    } catch (error: any) {
      toast({
        title: "Reservation Failed",
        description: error.message,
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    const enteredAmount = parseFloat(paymentAmount);

    if (isNaN(enteredAmount) || Math.abs(enteredAmount - totalAmount) > 0.01) {
      toast({
        title: "Invalid Amount",
        description: `Please enter exactly ৳${totalAmount.toFixed(2)}`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tickets/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          paymentAmount: enteredAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      // Fetch full ticket details
      const ticketsResponse = await fetch("/api/tickets/user");
      const ticketsData = await ticketsResponse.json();

      if (ticketsResponse.ok && ticketsData.ticketGroups.length > 0) {
        const eventTickets = ticketsData.ticketGroups.find(
          (group: any) => group.event.id === event.id
        );
        if (eventTickets) {
          setPurchasedTickets(eventTickets.tickets);
        }
      }

      setCurrentStep("tickets");
      toast({
        title: "Success!",
        description: `${quantity} ticket(s) purchased successfully`,
        duration: 2000,
      });
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(null);
    setQuantity(1);
    setPaymentAmount("");
    setSessionId("");
    setExpiresAt("");
    setPurchasedTickets([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div onClick={handleTriggerClick}>{trigger}</div>

      {/* Confirmation Modal */}
      <Dialog
        open={currentStep === "confirmation"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Buy Tickets</DialogTitle>
            <DialogDescription>
              Confirm your ticket purchase for this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-lg mb-3">{event.title}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Price</span>
                  <span className="text-lg font-bold text-primary">
                    ৳{event.ticketPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Buy Tickets
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quantity Selector Modal */}
      <Dialog
        open={currentStep === "quantity"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Quantity</DialogTitle>
            <DialogDescription>
              How many tickets would you like to purchase?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Ticket Price</p>
                <p className="text-3xl font-bold text-primary">
                  ৳{event.ticketPrice.toFixed(2)}
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
                <p className="text-sm text-gray-600">
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

            <Card className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ৳{totalAmount.toFixed(2)}
                </span>
              </div>
            </Card>

            <p className="text-xs text-center text-gray-500">
              {availableTickets} tickets available
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep("confirmation")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleProceedToCheckout}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reserving...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Summary Modal */}
      <Dialog
        open={currentStep === "checkout"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout Summary</DialogTitle>
            <DialogDescription>Review your order details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">{event.title}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket Price</span>
                  <span>৳{event.ticketPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">৳{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {expiresAt && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  ⏰ Reservation expires in 15 minutes. Complete payment soon!
                </p>
              </div>
            )}

            <Button
              onClick={() => setCurrentStep("payment")}
              className="w-full"
              size="lg"
            >
              Pay Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mock Payment Modal */}
      <Dialog
        open={currentStep === "payment"}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>
              Enter the exact amount to complete your purchase
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">
                  ৳{totalAmount.toFixed(2)}
                </p>
              </div>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Enter Amount (৳)</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                placeholder={totalAmount.toFixed(2)}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                Please enter exactly ৳{totalAmount.toFixed(2)} to proceed
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep("checkout")}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handlePayNow}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating tickets...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success & Ticket Display */}
      {currentStep === "tickets" && purchasedTickets.length > 0 && (
        <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Purchase Successful!
              </DialogTitle>
              <DialogDescription>
                Your tickets have been generated and sent to your email
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ {quantity} ticket(s) purchased successfully
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Check your email for ticket details
                </p>
              </Card>

              <div className="flex gap-2">
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="flex-1"
                >
                  View My Tickets
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Standalone Ticket Display */}
      {currentStep === null && purchasedTickets.length > 0 && (
        <TicketDisplay
          isOpen={false}
          onClose={handleClose}
          tickets={purchasedTickets}
          event={{
            title: event.title,
            date: event.date,
            time: event.time,
            location: event.location,
            organizerName: event.organizerName,
            image: event.image,
          }}
        />
      )}
    </>
  );
}
