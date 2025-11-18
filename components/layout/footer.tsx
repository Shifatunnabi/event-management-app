import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"

const APP_NAME = "EventGhor"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="w-full lg:grid lg:grid-cols-16 lg:gap-0">
        <div className="col-span-2 lg:block hidden"></div>
        <div className="col-span-12 px-4 lg:px-4 sm:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">{APP_NAME}</h3>
            <p className="text-sm text-white/70">
              Your premier event management and ticketing platform. Discover amazing events and create unforgettable
              experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-white/70 hover:text-white">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/vendor-directory" className="text-white/70 hover:text-white">
                  Vendor Directory
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-white/70 hover:text-white">
                  Job Portal
                </Link>
              </li>
              <li>
                <Link href="/organizer/dashboard" className="text-white/70 hover:text-white">
                  Create Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-white/70 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-white/70 hover:text-white">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="flex gap-4">
              <Link href="https://www.facebook.com/EventGhorBD" target="_blank" rel="noopener noreferrer" className="text-white/70 transition-colors hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/70 transition-colors hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/70 transition-colors hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-white/70 transition-colors hover:text-white">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

          <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm text-white/70">
            <p>&copy; 2025 {APP_NAME}. All rights reserved.</p>
          </div>
        </div>
        <div className="col-span-2 lg:block hidden"></div>
      </div>
    </footer>
  )
}
