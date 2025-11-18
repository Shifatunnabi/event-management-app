import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Globe, Facebook } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Logo */}
        <div className="mb-8 text-center">
          {/* <div className="mb-6 flex justify-center">
            <Image
              src="/eventghor-logo.png"
              alt="EventGhor Logo"
              width={50}
              height={20}
              className="h-auto w-auto"
              priority
            />
          </div> */}
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Contact Us</h1>
          <p className="text-muted-foreground">
            Get in touch with the EventGhor team. We're here to help!
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7c07]/10">
                <Mail className="h-6 w-6 text-[#ff7c07]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Email</h3>
              <a
                href="mailto:contact@eventghor.com"
                className="text-[#ff7c07] hover:underline"
              >
                contact@eventghor.com
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Send us an email anytime
              </p>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7c07]/10">
                <Phone className="h-6 w-6 text-[#ff7c07]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Phone</h3>
              <a
                href="tel:+8801234567890"
                className="text-[#ff7c07] hover:underline"
              >
                +880 1234 567 890
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Call us during business hours
              </p>
            </CardContent>
          </Card>

          {/* Office Location */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7c07]/10">
                <MapPin className="h-6 w-6 text-[#ff7c07]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Office Location</h3>
              <p className="text-muted-foreground">
                Dhaka, Bangladesh
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Visit us at our office
              </p>
            </CardContent>
          </Card>

          {/* Website */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7c07]/10">
                <Globe className="h-6 w-6 text-[#ff7c07]" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Website</h3>
              <a
                href="https://eventghor.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff7c07] hover:underline"
              >
                www.eventghor.com
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                Visit our website
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Social Media */}
        <Card className="mt-6 transition-shadow hover:shadow-lg">
          <CardContent className="p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff7c07]/10">
              <Facebook className="h-6 w-6 text-[#ff7c07]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Follow Us on Facebook</h3>
            <a
              href="https://www.facebook.com/EventGhorBD"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff7c07] hover:underline"
            >
              facebook.com/EventGhorBD
            </a>
            <p className="mt-2 text-sm text-muted-foreground">
              Stay updated with our latest events and announcements
            </p>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Business Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saturday - Thursday:</span>
                <span className="font-medium">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Friday:</span>
                <span className="font-medium">Closed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
