import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "react-hot-toast"
import "./globals.css"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import MobileNav from "@/components/layout/mobile-nav"
import AppLoader from "@/components/app-loader"
import LayoutWrapper from "@/components/layout/layout-wrapper"
import { AuthProvider } from "@/components/auth/auth-provider"
import PopupAdDisplay from "@/components/ads/popup-ad-display"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EventGhor ",
  description: "A premier event management and ticketing platform",
    generator: 'MarcoPolo Digital'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <AuthProvider>
          <Toaster />
          <AppLoader>
            <Header />
            <main className="min-h-screen pt-20 pb-20 md:pb-0 bg-white">
              <LayoutWrapper>{children}</LayoutWrapper>
            </main>
            <Footer />
            <MobileNav />
            <PopupAdDisplay />
          </AppLoader>
        </AuthProvider>
      </body>
    </html>
  )
}
