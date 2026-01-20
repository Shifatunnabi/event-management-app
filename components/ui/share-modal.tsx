"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title: string
}

export default function ShareModal({ open, onOpenChange, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Event link has been copied to clipboard",
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(fbUrl, "_blank", "width=600,height=400")
  }

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    window.open(twitterUrl, "_blank", "width=600,height=400")
  }

  const shareOnMessenger = () => {
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(url)}`
    window.open(messengerUrl, "_blank", "width=600,height=400")
  }

  const shareOnInstagram = () => {
    // Instagram doesn't support direct web sharing, so copy link for user to share manually
    handleCopy()
    toast({
      title: "Link copied for Instagram",
      description: "Paste this link in your Instagram story or post",
      duration: 2000,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription>Share this event with your friends and community</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Event Link</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                value={url}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-2">
            <Label>Share on Social Media</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={shareOnFacebook}
              >
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={shareOnMessenger}
              >
                <MessageCircle className="h-4 w-4 text-blue-500" />
                Messenger
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={shareOnTwitter}
              >
                <Twitter className="h-4 w-4 text-sky-500" />
                Twitter
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={shareOnInstagram}
              >
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
