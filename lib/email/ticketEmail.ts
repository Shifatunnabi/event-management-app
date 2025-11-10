import nodemailer from "nodemailer";
import Ticket from "@/lib/db/models/Ticket";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface TicketData {
  _id: string;
  ticketId?: string;
  qrData: string;
  qrSignature: string;
  price: number;
}

interface EventDetails {
  title: string;
  date: string;
  time: string;
  location: string;
  locationLink?: string;
  organizerName: string;
  image: string;
}

/**
 * Generate HTML email template for tickets
 */
function generateTicketEmailHTML(
  userName: string,
  tickets: TicketData[],
  eventDetails: EventDetails
): string {
  const ticketRows = tickets
    .map(
      (ticket, index) => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid #eee;">
        <div style="font-weight: 600; color: #333; margin-bottom: 5px;">
          Ticket #${index + 1}
        </div>
        <div style="font-size: 12px; color: #666; font-family: monospace;">
          ID: ${ticket.ticketId || ticket._id}
        </div>
      </td>
      <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
        ৳${ticket.price.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

  const eventDate = new Date(eventDetails.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Event Tickets</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
            🎉 EventGhor
          </h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Your Tickets Are Ready!
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <!-- Greeting -->
          <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
            Hello <strong>${userName}</strong>,
          </p>

          <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 30px 0;">
            Thank you for your purchase! Your tickets for <strong>${eventDetails.title}</strong> have been generated successfully. Please find your ticket details below.
          </p>

          <!-- Event Details Card -->
          <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #e9ecef;">
            <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #333;">
              📅 Event Details
            </h2>
            
            <div style="margin-bottom: 15px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Event</div>
              <div style="font-size: 16px; color: #333; font-weight: 600;">${eventDetails.title}</div>
            </div>

            <div style="margin-bottom: 15px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</div>
              <div style="font-size: 14px; color: #333;">${eventDate}</div>
              <div style="font-size: 14px; color: #333;">${eventDetails.time}</div>
            </div>

            <div style="margin-bottom: 15px;">
              <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Location</div>
              <div style="font-size: 14px; color: #333;">${eventDetails.location}</div>
            </div>

            <div>
              <div style="font-size: 12px; color: #666; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Organizer</div>
              <div style="font-size: 14px; color: #333;">${eventDetails.organizerName}</div>
            </div>
          </div>

          <!-- Tickets Summary -->
          <div style="background-color: #fff; border-radius: 12px; border: 1px solid #e9ecef; overflow: hidden; margin-bottom: 30px;">
            <div style="background-color: #f8f9fa; padding: 15px 20px; border-bottom: 2px solid #667eea;">
              <h2 style="margin: 0; font-size: 18px; color: #333;">
                🎫 Your Tickets
              </h2>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              ${ticketRows}
              <tr style="background-color: #f8f9fa;">
                <td style="padding: 15px; font-weight: 700; color: #333;">
                  Total Amount
                </td>
                <td style="padding: 15px; text-align: right; font-weight: 700; color: #667eea; font-size: 18px;">
                  ৳${totalAmount.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>

          <!-- Instructions -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">
              📌 Important Instructions
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
              <li>View and download your tickets from your dashboard</li>
              <li>Each ticket contains a unique QR code - DO NOT share it</li>
              <li>Present the QR code at the event entrance for scanning</li>
              <li>Tickets expire after being scanned or when the event finishes</li>
              <li>Arrive early to avoid queues at the entrance</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View My Tickets
            </a>
          </div>

          <!-- Footer Message -->
          <p style="font-size: 14px; color: #666; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
            If you have any questions, please contact the event organizer or visit our
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #667eea; text-decoration: none;">website</a>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
            This email was sent by EventGhor
          </p>
          <p style="margin: 0; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} EventGhor. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send ticket email to user
 */
export async function sendTicketEmail(
  userEmail: string,
  userName: string,
  tickets: TicketData[],
  eventDetails: EventDetails
): Promise<void> {
  try {
    const html = generateTicketEmailHTML(userName, tickets, eventDetails);

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: userEmail,
      subject: `Your Tickets for ${eventDetails.title}`,
      html,
    };

    await transporter.sendMail(mailOptions);

    // Update ticket emailSent status
    await Ticket.updateMany(
      { _id: { $in: tickets.map((t) => t._id) } },
      { emailSent: true }
    );

    console.log(`✅ Ticket email sent successfully to ${userEmail}`);
  } catch (error) {
    console.error("❌ Error sending ticket email:", error);
    throw error;
  }
}

/**
 * Verify transporter configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("✅ Email transporter is ready");
    return true;
  } catch (error) {
    console.error("❌ Email transporter verification failed:", error);
    return false;
  }
}
