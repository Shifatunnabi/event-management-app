import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
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
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last Updated: November 2024</p>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none p-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="mb-4">
              EventGhor ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you use our platform. By accessing 
              or using EventGhor, you consent to the practices described in this Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide</h3>
            <p className="mb-4">We collect information that you voluntarily provide when you:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Register an Account:</strong> Name, email address, phone number, address, password</li>
              <li><strong>Organizer Registration:</strong> NID number, organization name, payment details (bKash number)</li>
              <li><strong>Purchase Tickets:</strong> Payment transaction details, bKash number, ticket quantity</li>
              <li><strong>Vendor Registration:</strong> Business name, services offered, contact information, portfolio</li>
              <li><strong>Apply for Jobs:</strong> Name, email, phone, resume, cover letter</li>
              <li><strong>Contact Us:</strong> Any information you provide in communications with us</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <p className="mb-4">When you use EventGhor, we automatically collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, search queries</li>
              <li><strong>Cookies and Similar Technologies:</strong> To enhance user experience and analyze usage patterns</li>
              <li><strong>Location Data:</strong> General location based on IP address (not precise GPS)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Event-Related Information</h3>
            <p className="mb-4">We collect information related to events you create, attend, or show interest in:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Event details (title, description, date, location, images)</li>
              <li>Ticket purchases and reservation history</li>
              <li>QR codes generated for ticket validation</li>
              <li>Payment transaction IDs and verification status</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information for the following purposes:</p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Service Delivery</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Create and manage user accounts</li>
              <li>Process ticket purchases and reservations</li>
              <li>Generate and deliver PDF tickets with QR codes</li>
              <li>Send email notifications about bookings and events</li>
              <li>Verify payment transactions for premium events</li>
              <li>Facilitate communication between users, organizers, and vendors</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Platform Improvement</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Analyze usage patterns to improve user experience</li>
              <li>Develop new features and services</li>
              <li>Troubleshoot technical issues</li>
              <li>Conduct research and analytics</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Security and Compliance</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Prevent fraud and unauthorized access</li>
              <li>Verify organizer credentials and approve accounts</li>
              <li>Enforce our Terms and Conditions</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.4 Communication</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Send booking confirmations and ticket delivery emails</li>
              <li>Notify you of payment verification status</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Send promotional emails (with your consent)</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">4. Information Sharing and Disclosure</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 With Event Organizers</h3>
            <p className="mb-4">
              When you purchase a ticket, we share your name, email, phone number, and ticket details with the 
              event organizer to facilitate event attendance and communication.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 With Service Providers</h3>
            <p className="mb-4">
              We may share information with third-party service providers who assist us with:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email delivery (Nodemailer)</li>
              <li>Database hosting (MongoDB)</li>
              <li>Payment processing</li>
              <li>Analytics and monitoring</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Legal Requirements</h3>
            <p className="mb-4">
              We may disclose your information if required by law or in response to valid legal requests, such as 
              court orders or government investigations.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Business Transfers</h3>
            <p className="mb-4">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to 
              the acquiring entity.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.5 With Your Consent</h3>
            <p className="mb-4">
              We may share your information with other parties when you provide explicit consent.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure authentication using NextAuth</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and user permission systems</li>
              <li>Unique transaction ID verification to prevent duplicates</li>
            </ul>
            <p className="mb-4">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute 
              security of your information.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">6. Data Retention</h2>
            <p className="mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain ticket purchase history for verification</li>
            </ul>
            <p className="mb-4">
              Expired ticket reservations (after 20 minutes) are automatically updated to EXPIRED status, and 
              associated tickets are released back to availability.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">7. Your Rights and Choices</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Access and Update</h3>
            <p className="mb-4">
              You can access and update your account information through your user dashboard.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Account Deletion</h3>
            <p className="mb-4">
              You can request deletion of your account by contacting us. Note that some information may be retained 
              for legal or legitimate business purposes.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.3 Marketing Communications</h3>
            <p className="mb-4">
              You can opt out of promotional emails by clicking the unsubscribe link in any marketing email. You 
              will still receive transactional emails related to your bookings.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.4 Cookies</h3>
            <p className="mb-4">
              You can control cookies through your browser settings. Disabling cookies may affect platform functionality.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">8. Children's Privacy</h2>
            <p className="mb-4">
              EventGhor is not intended for users under 18 years of age. We do not knowingly collect information 
              from children. If you believe we have collected information from a child, please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">9. Third-Party Links</h2>
            <p className="mb-4">
              Our platform may contain links to third-party websites or services. We are not responsible for the 
              privacy practices of these third parties. We encourage you to review their privacy policies.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">10. International Data Transfers</h2>
            <p className="mb-4">
              Your information may be transferred to and processed in countries other than Bangladesh. We ensure 
              that such transfers comply with applicable data protection laws.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">11. Changes to Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant changes via 
              email or through the platform. Your continued use after such changes constitutes acceptance of the 
              updated policy.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p className="mb-2">
              <strong>Email:</strong> <a href="mailto:contact@eventghor.com" className="text-[#ff7c07] hover:underline">contact@eventghor.com</a>
            </p>
            <p className="mb-2">
              <strong>Phone:</strong> <a href="tel:+8801234567890" className="text-[#ff7c07] hover:underline">+880 1234 567 890</a>
            </p>
            <p className="mb-4">
              <strong>Address:</strong> Dhaka, Bangladesh
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">13. Ticketing System Specific Privacy Practices</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">13.1 Ticket Booking Data</h3>
            <p className="mb-4">
              When you book a ticket, we collect and process:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Event and ticket type selection</li>
              <li>Quantity of tickets purchased</li>
              <li>bKash transaction details (number and transaction ID)</li>
              <li>Booking status (RESERVED, PENDING, CONFIRMED, EXPIRED, REJECTED)</li>
              <li>Email delivery status and retry attempts</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.2 QR Code and PDF Tickets</h3>
            <p className="mb-4">
              We generate unique QR codes for each ticket containing:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Ticket ID and booking ID</li>
              <li>Event information</li>
              <li>Cryptographic signature for validation</li>
            </ul>
            <p className="mb-4">
              These QR codes are used at event entry for verification purposes only.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">13.3 Duplicate Purchase Prevention</h3>
            <p className="mb-4">
              We track your ticket purchases to prevent multiple bookings for the same event, ensuring fair access 
              to limited tickets.
            </p>

            <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
              <p>By using EventGhor, you acknowledge that you have read and understood this Privacy Policy.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
