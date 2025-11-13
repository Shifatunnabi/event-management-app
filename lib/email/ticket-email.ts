import nodemailer from "nodemailer"

// Configure your email service
// You'll need to set these environment variables:
// EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export async function sendEmailWithRetry(
  options: EmailOptions,
  maxRetries: number = 3
): Promise<boolean> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to send email to ${options.to}`)

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      })

      console.log(`Email sent successfully: ${info.messageId}`)
      return true
    } catch (error: any) {
      console.error(`Email attempt ${attempt} failed:`, error.message)
      lastError = error

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        console.log(`Waiting ${waitTime}ms before retry...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }
  }

  console.error(`All ${maxRetries} email attempts failed`)
  throw lastError || new Error("Failed to send email after all retries")
}

export async function sendTicketEmail(
  userEmail: string,
  userName: string,
  eventTitle: string,
  numberOfTickets: number,
  pdfBuffer: Buffer
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .ticket-info {
          background-color: white;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #4F46E5;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Event Tickets</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          
          <p>Thank you for your booking! Your tickets for <strong>${eventTitle}</strong> have been confirmed.</p>
          
          <div class="ticket-info">
            <h3>Booking Details</h3>
            <p><strong>Number of Tickets:</strong> ${numberOfTickets}</p>
            <p><strong>Event:</strong> ${eventTitle}</p>
          </div>
          
          <p>Your tickets are attached as a PDF file to this email. Please:</p>
          <ul>
            <li>Download and save the PDF on your device</li>
            <li>Bring the tickets (digital or printed) to the event</li>
            <li>Present the QR code at the entrance for scanning</li>
          </ul>
          
          <p><strong>Important:</strong> Each ticket has a unique QR code. Do not share your tickets with others.</p>
          
          <p>We look forward to seeing you at the event!</p>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>If you have any questions, please contact the event organizer.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmailWithRetry({
    to: userEmail,
    subject: `Your Tickets for ${eventTitle}`,
    html,
    attachments: [
      {
        filename: `tickets-${eventTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  })
}
