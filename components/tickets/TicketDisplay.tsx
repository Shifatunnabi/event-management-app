"use client";

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
}

interface EventData {
  title: string;
  date: string;
  time: string;
  location: string;
  organizerName: string;
  image: string;
}

interface TicketDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketData[];
  event: EventData;
}

export default function TicketDisplay({
  isOpen,
  onClose,
  tickets,
  event,
}: TicketDisplayProps) {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold flex items-center justify-between">
            <span>Your Tickets</span>
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
            <Card key={ticket.id} className="p-6 space-y-4">
              {/* Ticket Counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TicketIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">
                    Ticket {index + 1}/{tickets.length}
                  </span>
                </div>
                <Badge className={getStatusColor(ticket.status)}>
                  {getStatusText(ticket.status)}
                </Badge>
              </div>

              {/* Event Title */}
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  {event.title}
                </h3>
              </div>

              {/* Attendee Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Attendee Info
                  </p>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm font-medium">Phone</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Event Details
                  </p>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-sm font-medium">{formatDate(event.date)}</p>
                  <p className="text-sm font-medium">{event.time}</p>
                  <p className="text-sm font-medium">{event.location}</p>
                </div>
              </div>

              {/* QR Codes Grid */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  QR Codes
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ticket.qrCodes.map((qrCode) => (
                    <div
                      key={qrCode.qrSignature}
                      className={`border-2 rounded-lg p-4 ${
                        qrCode.scanned
                          ? "border-gray-300 bg-gray-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">
                          QR Type
                        </p>
                        {qrCode.scanned && (
                          <Badge variant="secondary" className="text-xs">
                            Scanned
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg font-bold mb-3">
                        {getQRTypeLabel(qrCode.type)}
                      </p>
                      <div className="flex justify-center bg-white p-3 rounded">
                        <QRCodeSVG
                          value={qrCode.qrData}
                          size={120}
                          level="H"
                          className={qrCode.scanned ? "opacity-50" : ""}
                        />
                      </div>
                      {qrCode.scanned && qrCode.scannedAt && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Scanned: {new Date(qrCode.scannedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket ID */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Ticket ID
                </p>
                <p className="font-mono text-sm font-semibold break-all">
                  {ticket.id}
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      Organizer
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {event.organizerName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Ticket Price
                </span>
                <span className="text-lg font-bold text-primary">
                  ৳{ticket.price.toFixed(2)}
                </span>
              </div>
            </Card>
          ))}

          {/* Instructions */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200 mb-2">
              📌 Important Instructions
            </h4>
            <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
              <li>Present the appropriate QR code for each service</li>
              <li>Entry QR code is required for venue access</li>
              <li>DO NOT share your QR codes with anyone</li>
              <li>Each QR code can only be scanned once</li>
              <li>Tickets cannot be transferred or refunded</li>
              <li>Arrive early to avoid queues</li>
            </ul>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
