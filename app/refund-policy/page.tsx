import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          {/* <div className="mb-6 flex justify-center">
            <Image
              src="/eventghor-logo.png"
              alt="EventGhor Logo"
              width={200}
              height={80}
              className="h-auto w-auto"
              priority
            />
          </div> */}
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Refund & Cancellation Policy</h1>
          <p className="text-sm text-muted-foreground">Last Updated: November 2024</p>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none p-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="mb-4">
              This Refund and Cancellation Policy outlines the terms and conditions for refunds and cancellations 
              on EventGhor. By purchasing tickets through our platform, you agree to this policy. Please read it 
              carefully before making any purchase.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">2. General Policy</h2>
            <p className="mb-4">
              EventGhor acts as an intermediary platform connecting event attendees with event organizers. Refund 
              and cancellation policies are primarily determined by individual event organizers. This policy provides 
              general guidelines and platform-specific rules.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">3. Ticket Cancellation by Users</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Cancellation Requests</h3>
            <p className="mb-4">
              If you wish to cancel your ticket purchase, you must contact the event organizer directly. 
              Cancellation requests should be made as early as possible to maximize the chances of approval.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Cancellation Timeframe</h3>
            <p className="mb-4">
              The following general timeframes apply, unless otherwise specified by the event organizer:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>More than 7 days before event:</strong> Full refund possible (minus processing fees)</li>
              <li><strong>3-7 days before event:</strong> Partial refund (50-70% of ticket price)</li>
              <li><strong>Less than 3 days before event:</strong> No refund (organizer's discretion)</li>
              <li><strong>Day of event:</strong> No refund</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Free Tickets</h3>
            <p className="mb-4">
              Free tickets can be cancelled at any time before the event. However, please cancel promptly if you 
              cannot attend, so the ticket becomes available for others.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">4. Event Cancellation by Organizers</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Full Refund</h3>
            <p className="mb-4">
              If an event is cancelled by the organizer, all ticket holders are entitled to a full refund, 
              including any processing fees. Refunds will be processed within 7-14 business days.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Event Postponement</h3>
            <p className="mb-4">
              If an event is postponed to a new date:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your ticket remains valid for the new date</li>
              <li>If you cannot attend the new date, you may request a refund</li>
              <li>Refund requests must be made within 7 days of the postponement announcement</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Venue or Content Changes</h3>
            <p className="mb-4">
              Minor changes to event venue, time, or content do not automatically qualify for refunds. Significant 
              changes may be evaluated on a case-by-case basis.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">5. Refund Process</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 How to Request a Refund</h3>
            <p className="mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li>Contact the event organizer through their provided contact information</li>
              <li>Provide your booking confirmation and ticket details</li>
              <li>State your reason for requesting a refund</li>
              <li>Wait for the organizer's decision (typically within 48-72 hours)</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Refund Method</h3>
            <p className="mb-4">
              Refunds will be processed through the same payment method used for the original purchase:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>bKash Payment:</strong> Refund to your bKash account</li>
              <li><strong>Free Tickets:</strong> Ticket simply gets cancelled</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Processing Time</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Approved refunds are processed within 7-14 business days</li>
              <li>bKash refunds may take 3-5 business days to reflect in your account</li>
              <li>You will receive an email confirmation once the refund is processed</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.4 Refund Fees</h3>
            <p className="mb-4">
              EventGhor may deduct a small processing fee (typically 5-10%) from refunds to cover transaction costs. 
              This fee is waived if the event is cancelled by the organizer.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">6. Non-Refundable Situations</h2>
            <p className="mb-4">
              Refunds will not be issued in the following situations:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Failure to attend the event without prior cancellation</li>
              <li>Late arrival or missing the event due to personal reasons</li>
              <li>Dissatisfaction with the event (unless significant breach of advertised content)</li>
              <li>Violation of event terms and conditions resulting in denied entry</li>
              <li>Loss or damage to physical tickets (digital QR code should be safely stored)</li>
              <li>Technical issues on the attendee's end (lost email, phone, etc.)</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">7. Ticket Transfer</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Transfer to Another Person</h3>
            <p className="mb-4">
              If you cannot attend an event, you may transfer your ticket to another person by:
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li>Contacting the event organizer</li>
              <li>Providing details of the new attendee</li>
              <li>Forwarding the ticket email/PDF to the new attendee</li>
            </ol>
            <p className="mb-4">
              Note: Some events may not allow ticket transfers. Check the event-specific policy.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">8. Payment Verification Issues</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">8.1 Rejected Payments</h3>
            <p className="mb-4">
              If your payment is rejected by the organizer (incorrect transaction ID, payment not received, etc.):
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your booking status will be changed to REJECTED</li>
              <li>You will be notified via email</li>
              <li>You can resubmit with correct payment details or request a refund</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">8.2 Expired Reservations</h3>
            <p className="mb-4">
              If you reserve tickets but don't complete payment within 20 minutes:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your reservation will automatically expire</li>
              <li>Tickets will be released back to availability</li>
              <li>No refund is applicable as no payment was made</li>
              <li>You can make a new booking if tickets are still available</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">9. Duplicate Purchase Policy</h2>
            <p className="mb-4">
              EventGhor prevents duplicate ticket purchases for the same event by the same user. If you attempt 
              to purchase tickets for an event you've already booked:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>The system will prevent the duplicate purchase</li>
              <li>You will be notified that you already have tickets</li>
              <li>To purchase additional tickets, contact the organizer directly</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">10. Force Majeure</h2>
            <p className="mb-4">
              In cases of force majeure (natural disasters, pandemics, government restrictions, etc.):
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Event organizers may cancel or postpone events without liability</li>
              <li>Refund policies will be determined on a case-by-case basis</li>
              <li>EventGhor will facilitate communication between organizers and attendees</li>
              <li>Platform fees may be waived in exceptional circumstances</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">11. Disputes and Complaints</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">11.1 Resolution Process</h3>
            <p className="mb-4">
              If you have a dispute regarding refunds or cancellations:
            </p>
            <ol className="list-decimal pl-6 mb-4">
              <li>First, attempt to resolve the issue directly with the event organizer</li>
              <li>If unresolved, contact EventGhor support with your booking details</li>
              <li>We will mediate between you and the organizer</li>
              <li>A decision will be made within 5-7 business days</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-6">11.2 EventGhor's Role</h3>
            <p className="mb-4">
              EventGhor acts as a mediator but is not responsible for refund decisions made by event organizers. 
              However, we may intervene in cases of clear policy violations or fraudulent behavior.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">12. Organizer Responsibilities</h2>
            <p className="mb-4">
              Event organizers using EventGhor must:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Clearly communicate their cancellation and refund policy</li>
              <li>Process refund requests in a timely manner</li>
              <li>Notify attendees promptly of event cancellations or changes</li>
              <li>Comply with this general refund policy</li>
              <li>Maintain sufficient funds to process approved refunds</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">13. Contact for Refund Queries</h2>
            <p className="mb-4">
              For questions about refunds and cancellations:
            </p>
            <p className="mb-2">
              <strong>Primary Contact:</strong> Event Organizer (details provided in your booking confirmation)
            </p>
            <p className="mb-2">
              <strong>EventGhor Support:</strong>
            </p>
            <p className="mb-2 ml-4">
              Email: <a href="mailto:contact@eventghor.com" className="text-[#ff7c07] hover:underline">contact@eventghor.com</a>
            </p>
            <p className="mb-2 ml-4">
              Phone: <a href="tel:+8801234567890" className="text-[#ff7c07] hover:underline">+880 1234 567 890</a>
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">14. Changes to This Policy</h2>
            <p className="mb-4">
              EventGhor reserves the right to modify this Refund and Cancellation Policy at any time. Changes will 
              be communicated via email and posted on the platform. Your continued use after changes constitutes 
              acceptance of the updated policy.
            </p>

            <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
              <p>
                By purchasing tickets through EventGhor, you acknowledge that you have read, understood, and agree 
                to this Refund and Cancellation Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
