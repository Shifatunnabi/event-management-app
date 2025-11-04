import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import MobileNav from "@/components/layout/mobile-nav"
import AppLoader from "@/components/app-loader"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EventGhor - Discover & Create Amazing Events",
  description: "Your premier event management and ticketing platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <AppLoader>
          <Header />
          <main className="min-h-screen pt-20 pb-20 md:pb-0 bg-white">{children}</main>
          <Footer />
          <MobileNav />
        </AppLoader>
      </body>
    </html>
  )
}
