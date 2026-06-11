"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"

type Step = "email" | "code" | "password" | "success"

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setStep("email")
        setEmail("")
        setCode("")
        setPassword("")
        setConfirmPassword("")
        setShowPassword(false)
        setShowConfirmPassword(false)
        setError("")
        setLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Auto-close after success
  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(onClose, 2000)
      return () => clearTimeout(timer)
    }
  }, [step, onClose])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to send code")
      } else {
        setStep("code")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (codeValue: string) => {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid code")
        setCode("")
      } else {
        setStep("password")
      }
    } catch {
      setError("Something went wrong. Please try again.")
      setCode("")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 6)
    setCode(digits)
    setError("")
    if (digits.length === 6) {
      handleVerifyCode(digits)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to reset password")
      } else {
        setStep("success")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<Step, string> = {
    email: "Forgot Password",
    code: "Enter Verification Code",
    password: "Set New Password",
    success: "Password Reset",
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {(step === "code" || step === "password") && (
              <button
                type="button"
                onClick={() => { setError(""); setCode(""); setStep(step === "password" ? "code" : "email") }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <DialogTitle>{titles[step]}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ── Step 1: Email ── */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your account email and we'll send you a 6-digit verification code.
              </p>
              {error && <ErrorAlert message={error} />}
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <Input
                  id="fp-email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#ff7c07] hover:bg-[#e66f06] text-white"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Code"}
              </Button>
            </form>
          )}

          {/* ── Step 2: Code ── */}
          {step === "code" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below and it will verify automatically.
              </p>
              {error && <ErrorAlert message={error} />}
              <div className="space-y-2">
                <Label htmlFor="fp-code">Verification Code</Label>
                <div className="relative">
                  <Input
                    id="fp-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    maxLength={6}
                    autoFocus
                    disabled={loading}
                    className="text-center text-2xl font-bold tracking-[0.4em] pr-10"
                  />
                  {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: New password ── */}
          {step === "password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Choose a new password for your account. Minimum 6 characters.
              </p>
              {error && <ErrorAlert message={error} />}
              <div className="space-y-2">
                <Label htmlFor="fp-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="fp-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoFocus
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="fp-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#ff7c07] hover:bg-[#e66f06] text-white"
                disabled={loading}
              >
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : "Reset Password"}
              </Button>
            </form>
          )}

          {/* ── Success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle className="h-14 w-14 text-green-500" />
              <p className="font-semibold text-lg">Password reset successfully!</p>
              <p className="text-sm text-muted-foreground">You can now sign in with your new password.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
