import nodemailer from "nodemailer"

// Configure your email service
// You'll need to set these environment variables:
// EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD

// Debug logging for SMTP configuration
console.log("SMTP Configuration:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER,
  hasPassword: !!process.env.SMTP_PASS,
  passwordLength: process.env.SMTP_PASS?.length,
})

const port = parseInt(process.env.SMTP_PORT || "587")
const isSecure = process.env.SMTP_SECURE === "true"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: port,
  secure: isSecure, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
  debug: true,
  logger: true,
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
        from: `${process.env.FROM_NAME || "EventGhor"} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      })

      console.log(`Email sent successfully: ${info.messageId}`)
      return true
    } catch (error: any) {
      console.error(`Email attempt ${attempt} failed:`, {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      })
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
  pdfBuffer: Buffer,
  eventDate?: string,
  eventTime?: string,
  eventLocation?: string
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
          background-color: #ff7c07;
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
          border-left: 4px solid #ff7c07;
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
          <h1>Event Tickets</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          
          <p>Thank you for your booking! Your tickets for <strong>${eventTitle}</strong> have been confirmed.</p>
          
          <div class="ticket-info">
            <h3>Booking Details</h3>
            <p><strong>Number of Tickets:</strong> ${numberOfTickets}</p>
            <p><strong>Event:</strong> ${eventTitle}</p>
            ${eventDate ? `<p><strong>Date:</strong> ${eventDate}</p>` : ''}
            ${eventTime ? `<p><strong>Time:</strong> ${eventTime}</p>` : ''}
            ${eventLocation ? `<p><strong>Location:</strong> ${eventLocation}</p>` : ''}
          </div>
          
          <p>Tickets are attached as a PDF file to this email.</p>

          <p><strong>Important:</strong> Each ticket has a unique QR code. Do not share your tickets with others.</p>
          
          <p>We are looking forward to seeing you at the ${eventTitle}!</p>

          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
          
         
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmailWithRetry({
    to: userEmail,
    subject: `Tickets for ${eventTitle}`,
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
