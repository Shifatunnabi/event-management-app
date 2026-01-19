"use client"

import { Shield, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function BannedOrganizerMessage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-2xl border-red-200 bg-red-50">
        <CardContent className="p-8 md:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-600" />
            </div>

            {/* Main Message */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-red-900">
                Account Suspended
              </h1>
              <p className="text-lg text-red-800 max-w-md">
                Your organizer account has been temporarily suspended by the administrator.
              </p>
            </div>

            {/* Details */}
            <div className="space-y-4 w-full max-w-md">
              <div className="bg-white rounded-lg p-4 text-left border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">What does this mean?</h3>
                <p className="text-sm text-red-700">
                  You currently do not have access to your organizer dashboard and cannot perform any organizer activities. 
                  All your existing data is safe and will be restored when your account is reactivated.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 text-left border border-red-200">
                <h3 className="font-semibold text-red-900 mb-2">What should you do?</h3>
                <p className="text-sm text-red-700 mb-3">
                  Please contact the administrator to resolve this issue and get your account reinstated.
                </p>
                <a 
                  href="mailto:admin@eventghor.com" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact Admin Support
                </a>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-red-600 mt-4">
              We appreciate your patience and understanding.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
