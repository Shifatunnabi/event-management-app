import { jsPDF } from "jspdf"
import QRCode from "qrcode"

interface IQRCode {
  qrCodeType: string
  qrData: string
  qrSignature: string
  scanned: boolean
}

interface ITicket {
  ticketId: string
  ticketType: string
  qrCodeType: string
  qrCode: string
  qrSignature: string
  scanned: boolean
}

interface BookingData {
  _id: string
  userName: string
  userEmail: string
  userPhone: string
  numberOfTickets: number
  totalAmount: number
  tickets: ITicket[]
}

interface EventData {
  title: string
  description: string
  date: Date
  startTime: string
  endTime: string
  location: string
  organizerName?: string
}

export async function generateTicketPDF(
  booking: BookingData,
  event: EventData
): Promise<Buffer> {
  const doc = new jsPDF()

  // Group tickets by ticketId to handle multiple QR codes
  const ticketMap = new Map()
  
  for (const ticket of booking.tickets) {
    if (!ticketMap.has(ticket.ticketId)) {
      ticketMap.set(ticket.ticketId, {
        ticketId: ticket.ticketId,
        qrCodes: [],
        ticketType: ticket.ticketType,
      })
    }
    
    const ticketData = ticketMap.get(ticket.ticketId)
    ticketData.qrCodes.push({
      qrCodeType: ticket.qrCodeType,
      qrData: JSON.stringify({
        ticketId: ticket.ticketId,
        bookingId: booking._id.toString(),
        qrSignature: ticket.qrSignature,
        qrCodeType: ticket.qrCodeType,
        eventTitle: event.title,
      }),
      qrSignature: ticket.qrSignature,
      scanned: ticket.scanned,
    })
  }

  const tickets = Array.from(ticketMap.values())

  // Loop through each unique ticket (one page per ticket)
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i]

    if (i > 0) {
      doc.addPage()
    }

    // Set font
    doc.setFont("helvetica")

    // Set font
    doc.setFont("helvetica")

    // Title - "EVENT TICKET" (right-aligned, smaller)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("EVENT TICKET", 190, 15, { align: "right" })

    // Event Title (larger, centered)
    doc.setFontSize(20)
    doc.text(event.title, 105, 25, { align: "center" })

    // Organizer (smaller)
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Organized by ${event.organizerName || "Event Organizer"}`, 105, 32, { align: "center" })

    // Horizontal line
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(20, 37, 190, 37)

    // Two-column layout for info (more compact)
    const leftCol = 20
    const rightCol = 110
    const startY = 42

    // Left Column - ATTENDEE INFO
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("ATTENDEE INFO", leftCol, startY)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(booking.userName, leftCol, startY + 6)
    doc.text(booking.userEmail, leftCol, startY + 12)
    doc.text(booking.userPhone, leftCol, startY + 18)

    // Right Column - EVENT DETAILS
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("EVENT DETAILS", rightCol, startY)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    
    const eventDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    doc.text(eventDate, rightCol, startY + 6)
    doc.text(`${event.startTime} - ${event.endTime}`, rightCol, startY + 12)
    doc.text(event.location, rightCol, startY + 18, { maxWidth: 80 })
    doc.text(`Ticket Price: ${(booking.totalAmount / booking.numberOfTickets).toFixed(2)} BDT`, rightCol, startY + 24)

    // Horizontal line
    doc.line(20, 70, 190, 70)

    // Ticket ID (with gray background)
    doc.setFillColor(230, 230, 230)
    doc.roundedRect(leftCol, 72, 170, 12, 2, 2, 'F')
    
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    doc.text("Ticket ID:", leftCol + 18, 78)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text(ticket.ticketId, leftCol + 18, 82)

    // QR Codes Section (larger QR codes, no borders)
    const qrCodes = ticket.qrCodes
    const qrSize = 50
    const qrSpacing = 8
    const qrsPerRow = qrCodes.length === 6 ? 3 : qrCodes.length === 4 ? 2 : 3
    const startX = qrsPerRow === 3 ? 25 : 45
    const startQRY = 95

    // Generate and place QR codes
    for (let j = 0; j < qrCodes.length; j++) {
      const qr = qrCodes[j]
      const row = Math.floor(j / qrsPerRow)
      const col = j % qrsPerRow
      const x = startX + col * (qrSize + qrSpacing + 5)
      const y = startQRY + row * (qrSize + 18)

      // QR Label
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 0, 0)
      const label = qr.qrCodeType.charAt(0).toUpperCase() + qr.qrCodeType.slice(1)
      doc.text(label, x + qrSize / 2, y - 3, { align: "center" })

      // Create QR payload with both qrData and qrSignature
      const qrPayload = JSON.stringify({
        qrData: qr.qrData,
        qrSignature: qr.qrSignature
      })

      // Generate and add QR code (no border, larger size)
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 250,
        margin: 0,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      doc.addImage(qrCodeDataUrl, "PNG", x, y, qrSize, qrSize)
    }

    // Instructions (updated)
    const instructionsY = startQRY + Math.ceil(qrCodes.length / qrsPerRow) * (qrSize + 18) + 8
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text("Note:", leftCol, instructionsY)
    
    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 100, 100)
    
    const instructions = [
      "• Present the appropriate QR code for each service",
      "• Your ticket is valid only for the event date",
      "• DO NOT share your QR codes with anyone",
    ]
    
    instructions.forEach((inst, idx) => {
      doc.text(inst, leftCol + 2, instructionsY + 5 + (idx * 4))
    })

    // Footer - properly aligned in one line
    const footerY = 280
    const footerStartText = "This ticket is generated by "
    
    // Calculate total width to position from right
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    const startTextWidth = doc.getTextWidth(footerStartText)
    
    doc.setFont("helvetica", "bold")
    const eventGhorWidth = doc.getTextWidth("EventGhor")
    
    const totalWidth = startTextWidth + eventGhorWidth
    const footerStartX = 190 - totalWidth
    
    // Draw first part in gray
    doc.setFont("helvetica", "normal")
    doc.setTextColor(150, 150, 150)
    doc.text(footerStartText, footerStartX, footerY)
    
    // Draw "EventGhor" in orange and bold immediately after
    doc.setFont("helvetica", "bold")
    doc.setTextColor(255, 165, 0)
    doc.text("EventGhor", footerStartX + startTextWidth, footerY)
    
    // IMPORTANT: Reset text color to black for next page
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")
  }

  // Get PDF as buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"))
  return pdfBuffer
}
