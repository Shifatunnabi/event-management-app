import { jsPDF } from "jspdf"
import QRCode from "qrcode"

interface TicketData {
  ticketId: string
  qrSignature: string
  used: boolean
}

interface BookingData {
  _id: string
  userName: string
  userEmail: string
  userPhone: string
  numberOfTickets: number
  totalAmount: number
  tickets: TicketData[]
}

interface EventData {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  venue: string
}

export async function generateTicketPDF(
  booking: BookingData,
  event: EventData
): Promise<Buffer> {
  const doc = new jsPDF()

  // Set font
  doc.setFont("helvetica")

  // Loop through each ticket
  for (let i = 0; i < booking.tickets.length; i++) {
    const ticket = booking.tickets[i]

    if (i > 0) {
      doc.addPage()
    }

    // Title
    doc.setFontSize(22)
    doc.setTextColor(0, 0, 0)
    doc.text("EVENT TICKET", 105, 20, { align: "center" })

    // Event Details Section
    doc.setFontSize(16)
    doc.setTextColor(34, 34, 34)
    doc.text(event.title, 105, 35, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)

    const startDate = new Date(event.startDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const startTime = new Date(event.startDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    doc.text(`Date: ${startDate}`, 20, 50)
    doc.text(`Time: ${startTime}`, 20, 58)
    doc.text(`Venue: ${event.venue}`, 20, 66)
    doc.text(`Location: ${event.location}`, 20, 74)

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 85, 190, 85)

    // Attendee Information
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Attendee Information", 20, 95)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Name: ${booking.userName}`, 20, 105)
    doc.text(`Email: ${booking.userEmail}`, 20, 113)
    doc.text(`Phone: ${booking.userPhone}`, 20, 121)

    // Divider
    doc.line(20, 130, 190, 130)

    // Ticket Information
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Ticket Information", 20, 140)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Ticket ID: ${ticket.ticketId}`, 20, 150)
    doc.text(`Ticket ${i + 1} of ${booking.numberOfTickets}`, 20, 158)
    
    if (booking.totalAmount > 0) {
      doc.text(`Amount Paid: ৳${booking.totalAmount.toFixed(2)}`, 20, 166)
    } else {
      doc.text(`Type: FREE TICKET`, 20, 166)
    }

    // QR Code Section
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Scan to Verify", 105, 185, { align: "center" })

    // Generate QR code
    const qrData = JSON.stringify({
      ticketId: ticket.ticketId,
      bookingId: booking._id,
      qrSignature: ticket.qrSignature,
      eventTitle: event.title,
    })

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // Add QR code to PDF (centered)
    doc.addImage(qrCodeDataUrl, "PNG", 70, 195, 70, 70)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      "Please present this ticket at the event entrance. Keep this ticket safe.",
      105,
      280,
      { align: "center" }
    )
  }

  // Get PDF as buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
  return pdfBuffer
}
