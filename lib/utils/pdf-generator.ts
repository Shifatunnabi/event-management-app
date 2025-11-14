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
  date: Date
  time: string
  location: string
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

    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.text(`Date: ${eventDate}`, 20, 50)
    doc.text(`Time: ${event.time}`, 20, 58)
    doc.text(`Location: ${event.location}`, 20, 66)

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 78, 190, 78)

    // Attendee Information
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Attendee Information", 20, 88)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Name: ${booking.userName}`, 20, 98)
    doc.text(`Email: ${booking.userEmail}`, 20, 106)
    doc.text(`Phone: ${booking.userPhone}`, 20, 114)

    // Divider
    doc.line(20, 123, 190, 123)

    // Ticket Information
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Ticket Information", 20, 133)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Ticket ID: ${ticket.ticketId}`, 20, 143)
    doc.text(`Ticket ${i + 1} of ${booking.numberOfTickets}`, 20, 151)
    
    if (booking.totalAmount > 0) {
      doc.text(`Amount Paid: ৳${booking.totalAmount.toFixed(2)}`, 20, 159)
    } else {
      doc.text(`Type: FREE TICKET`, 20, 159)
    }

    // QR Code Section
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Scan to Verify", 105, 178, { align: "center" })

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
    doc.addImage(qrCodeDataUrl, "PNG", 70, 188, 70, 70)

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
