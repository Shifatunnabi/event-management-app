import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default function TermsPage() {
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
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground">Last Updated: November 2024</p>
        </div>

        <Card>
          <CardContent className="prose prose-sm max-w-none p-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to EventGhor! These Terms and Conditions ("Terms") govern your use of our website and services. 
              By accessing or using EventGhor, you agree to comply with and be bound by these Terms. If you do not 
              agree with any part of these Terms, please do not use our platform.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">2. Definitions</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>"Platform"</strong> refers to the EventGhor website and all related services.</li>
              <li><strong>"User"</strong> refers to anyone who accesses or uses the Platform.</li>
              <li><strong>"Organizer"</strong> refers to individuals or entities creating and managing events on the Platform.</li>
              <li><strong>"Attendee"</strong> refers to users who purchase tickets or register for events.</li>
              <li><strong>"Vendor"</strong> refers to service providers listed in the vendor directory.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">3. User Accounts</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">3.1 Account Creation</h3>
            <p className="mb-4">
              To access certain features of EventGhor, you must create an account. You agree to provide accurate, 
              current, and complete information during registration and to update such information as necessary.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Account Security</h3>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account. Notify us immediately of any unauthorized use.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">3.3 Account Types</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>User Account:</strong> For browsing events, purchasing tickets, and applying for jobs.</li>
              <li><strong>Organizer Account:</strong> For creating and managing events (requires admin approval).</li>
              <li><strong>Vendor Account:</strong> For listing services in the vendor directory.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">4. Event Tickets</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Ticket Purchase</h3>
            <p className="mb-4">
              When you purchase a ticket through EventGhor, you enter into a direct contract with the event organizer. 
              EventGhor acts as an intermediary platform and is not responsible for the event itself.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Payment</h3>
            <p className="mb-4">
              Payments are processed through our secure payment system. For manual payment verification events, 
              you must provide accurate bKash transaction details. Your ticket will be confirmed only after payment 
              verification by the organizer.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Ticket Delivery</h3>
            <p className="mb-4">
              Once your payment is verified, you will receive your ticket via email as a PDF with a QR code. 
              You are responsible for presenting this ticket at the event.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Ticket Limits</h3>
            <p className="mb-4">
              Each user can purchase tickets for an event only once. Multiple purchases for the same event are not allowed.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">5. Event Organizers</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Organizer Approval</h3>
            <p className="mb-4">
              To become an event organizer, you must submit your application including NID number and organization 
              details. Your account will be reviewed and approved by our admin team.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Event Management</h3>
            <p className="mb-4">
              Organizers are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Providing accurate event information</li>
              <li>Managing ticket sales and pricing</li>
              <li>Verifying payment details for premium events</li>
              <li>Delivering the event as described</li>
              <li>Handling refunds and cancellations per the Refund Policy</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Payment Processing</h3>
            <p className="mb-4">
              For premium events, organizers must provide a valid bKash number for receiving payments. Organizers 
              are responsible for verifying transaction IDs and approving ticket purchases.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">6. Vendor Directory</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">6.1 Vendor Listings</h3>
            <p className="mb-4">
              Vendors can register to list their event-related services on EventGhor. All vendor information must be 
              accurate and up-to-date.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">6.2 Vendor Responsibilities</h3>
            <p className="mb-4">
              Vendors are responsible for the quality of their services and must fulfill any commitments made to users. 
              EventGhor is not liable for disputes between vendors and users.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">7. Job Portal</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">7.1 Job Postings</h3>
            <p className="mb-4">
              Event organizers can post job opportunities related to their events. All job postings must comply with 
              applicable employment laws.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Job Applications</h3>
            <p className="mb-4">
              Users can apply for posted jobs through the platform. The hiring decision is solely at the discretion 
              of the event organizer.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">8. Prohibited Activities</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Post false, misleading, or fraudulent information</li>
              <li>Harass, threaten, or harm other users</li>
              <li>Interfere with the Platform's operation or security</li>
              <li>Use the Platform for unauthorized commercial purposes</li>
              <li>Attempt to duplicate ticket purchases for the same event</li>
              <li>Manipulate payment verification processes</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">9. Intellectual Property</h2>
            <p className="mb-4">
              All content on EventGhor, including text, graphics, logos, and software, is the property of EventGhor 
              or its licensors and is protected by intellectual property laws. You may not use, reproduce, or 
              distribute any content without our written permission.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">10. Disclaimer of Warranties</h2>
            <p className="mb-4">
              EventGhor is provided "as is" without warranties of any kind, either express or implied. We do not 
              guarantee that the Platform will be error-free, secure, or uninterrupted. We are not responsible for 
              the quality, safety, or legality of events listed on the Platform.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">11. Limitation of Liability</h2>
            <p className="mb-4">
              To the maximum extent permitted by law, EventGhor shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
              directly or indirectly.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">12. Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold harmless EventGhor and its affiliates from any claims, damages, 
              liabilities, and expenses arising from your use of the Platform or violation of these Terms.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">13. Termination</h2>
            <p className="mb-4">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms 
              or for any other reason. Upon termination, your right to use the Platform will immediately cease.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">14. Modifications to Terms</h2>
            <p className="mb-4">
              EventGhor may modify these Terms at any time. We will notify users of significant changes via email 
              or through the Platform. Your continued use of EventGhor after such modifications constitutes 
              acceptance of the updated Terms.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">15. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of Bangladesh. Any disputes 
              arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Bangladesh.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">16. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at:
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

            <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
              <p>By using EventGhor, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
