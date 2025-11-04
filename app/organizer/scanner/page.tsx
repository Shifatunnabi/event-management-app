"use client"

import { useState } from "react"
import { QrCode, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<"success" | "error" | null>(null)

  const handleScan = () => {
    // Simulate scanning
    const isValid = Math.random() > 0.3
    setScanResult(isValid ? "success" : "error")
    setTimeout(() => setScanResult(null), 3000)
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Ticket Scanner</h1>
        <p className="text-muted-foreground">Scan attendee tickets for entry verification</p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scanner Placeholder */}
            <div className="flex aspect-square items-center justify-center rounded-lg border-4 border-dashed border-muted-foreground/25 bg-muted/50">
              <div className="text-center">
                <QrCode className="mx-auto mb-4 h-24 w-24 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">Position QR code within frame</p>
                <p className="text-sm text-muted-foreground">Camera will automatically scan</p>
              </div>
            </div>

            {/* Scan Result */}
            {scanResult && (
              <div
                className={`rounded-lg p-4 ${scanResult === "success" ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900"}`}
              >
                <div className="flex items-center gap-3">
                  {scanResult === "success" ? (
                    <>
                      <CheckCircle className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">Valid Ticket</p>
                        <p className="text-sm">John Doe - VIP Pass</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">Invalid Ticket</p>
                        <p className="text-sm">This ticket has already been used or is not valid</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Manual Scan Button */}
            <Button onClick={handleScan} className="bg-[#ff7c07] hover:bg-[#e66f06] w-full text-white" size="lg">
              Simulate Scan
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">234</p>
                <p className="text-sm text-muted-foreground">Scanned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">228</p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">6</p>
                <p className="text-sm text-muted-foreground">Invalid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
