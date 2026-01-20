"use client";

import { useState } from "react";
import QRCodeSVG from "react-qr-code";
import { X, Calendar, Clock, MapPin, User, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface QRCodeData {
  type: string;
  qrData: string;
  qrSignature: string;
  scanned: boolean;
  scannedAt?: string;
}

interface TicketData {
  id: string;
  qrCodes: QRCodeData[];
  status: "ACTIVE" | "SCANNED" | "EXPIRED";
  price: number;
  purchaseDate: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
}

interface EventData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerName: string;
  image: string;
}

interface TicketDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketData[];
  event: EventData;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
}

export default function TicketDisplay({
  isOpen,
  onClose,
  tickets,
  event,
  attendeeName,
  attendeeEmail,
  attendeePhone,
}: TicketDisplayProps) {
  const [selectedQR, setSelectedQR] = useState<{ payload: string; type: string } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "SCANNED":
        return "bg-blue-500";
      case "EXPIRED":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "SCANNED":
        return "Scanned";
      case "EXPIRED":
        return "Expired";
      default:
        return status;
    }
  };

  const getQRTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-4 pb-2 border-b">
          <DialogTitle className="text-lg font-bold flex items-center justify-between">
            <span>Your Tickets ({tickets.length})</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {tickets.map((ticket, index) => (
            <Card key={ticket.id} className="p-6 bg-white border-2 border-gray-200 page-break">
              {/* Header */}
              <h2 className="text-xs font-bold text-right">EVENT TICKET</h2>
              <div className="text-center pb-2 border-b-2 border-gray-200">
                
                <h3 className="text-2xl font-semibold">{event.title}</h3>
                <p className="text-xs text-gray-600 mt-1">Organized by {event.organizerName}</p>
              </div>

              {/* Two Column Info Section */}
              <div className="grid grid-cols-2 gap-3 pb-2 border-b-2 border-gray-200">
                {/* Left Column - Attendee Info */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-700 mb-1">ATTENDEE INFO</h4>
                  <div className="space-y-1">
                    <p className="text-sm">{attendeeName || ticket.attendeeName || "N/A"}</p>
                    <p className="text-sm">{attendeeEmail || ticket.attendeeEmail || "N/A"}</p>
                    <p className="text-sm">{attendeePhone || ticket.attendeePhone || "N/A"}</p>
                  </div>
                </div>

                {/* Right Column - Event Details */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-700 mb-1">EVENT DETAILS</h4>
                  <div className="space-y-1">
                    <p className="text-sm">{formatDate(event.date)}</p>
                    <p className="text-sm">{event.startTime} - {event.endTime}</p>
                    <p className="text-sm">{event.location}</p>
                    <p className="text-sm">Ticket Price: {ticket.price.toFixed(2)} BDT</p>
                  </div>
                </div>
              </div>

              {/* Ticket ID */}
              <div className=" bg-gray-300/40 rounded-lg p-1 pl-8 my-2">
                <p className="text-xs text-gray-600 mb-1">Ticket ID:</p>
                <p className="font-mono text-sm font-semibold">{ticket.id}</p>
              </div>

              {/* QR Codes Grid */}
              <div className={`grid gap-4 mb-6 ${
                ticket.qrCodes.length === 6 ? "grid-cols-3" :
                ticket.qrCodes.length === 4 ? "grid-cols-2" :
                ticket.qrCodes.length === 2 ? "grid-cols-2" :
                "grid-cols-3"
              }`}>
                {ticket.qrCodes.map((qrCode) => {
                  // Create QR payload with both qrData and qrSignature
                  const qrPayload = JSON.stringify({
                    qrData: qrCode.qrData,
                    qrSignature: qrCode.qrSignature
                  });
                  
                  return (
                    <div key={qrCode.qrSignature} className="flex flex-col items-center">
                      <p className="text-sm font-bold mb-2">{getQRTypeLabel(qrCode.type)}</p>
                      <div 
                        className={`cursor-pointer transition-transform hover:scale-105 ${qrCode.scanned ? "opacity-50" : ""}`}
                        onClick={() => setSelectedQR({ payload: qrPayload, type: qrCode.type })}
                      >
                        <QRCodeSVG
                          value={qrPayload}
                          size={120}
                          level="H"
                        />
                      </div>
                      {qrCode.scanned && (
                        <Badge variant="secondary" className="text-xs mt-2">
                          Scanned
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Instructions */}
              <div className="text-xs text-gray-600">
                <p className="text-sm font-bold underline mb-1">Note:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Present the appropriate QR code for each service</li>
                  <li>Your ticket is valid only for the event date</li>
                  <li>DO NOT share your QR codes with anyone</li>
                  
                </ul>
              </div>

              {/* Footer */}
              <div className="text-right text-xs text-gray-500">
                This ticket is generated by <span className="text-orange-400">EventGhor</span>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>

      {/* QR Code Popup Dialog */}
      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent className="sm:max-w-md max-w-[90vw] p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold">
              {selectedQR && getQRTypeLabel(selectedQR.type)} QR Code
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedQR(null)}
              className="absolute right-4 top-4 h-8 w-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              {/* <X className="h-4 w-4" /> */}
              <span className="sr-only">Close</span>
            </Button>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {selectedQR && (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG
                  value={selectedQR.payload}
                  size={Math.min(300, window.innerWidth - 120)}
                  level="H"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Scan this QR code at the event venue
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
