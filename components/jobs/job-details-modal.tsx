"use client"

import { Calendar, MapPin, Clock, DollarSign, Users, Briefcase } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Job } from "@/data/jobs"

interface JobDetailsModalProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function JobDetailsModal({ job, open, onOpenChange }: JobDetailsModalProps) {
  if (!job) return null

  const formattedDate = new Date(job.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const postedDate = new Date(job.postedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
              <p className="mt-1 text-muted-foreground">{job.eventName}</p>
            </div>
            <Badge variant="secondary">{job.type}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{job.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium">{job.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="font-medium">{job.salary}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Organizer Info */}
          <div>
            <h3 className="mb-2 font-semibold">Organizer</h3>
            <p className="text-sm text-muted-foreground">{job.organizer}</p>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="mb-2 font-semibold">Job Description</h3>
            <p className="text-sm text-muted-foreground">{job.description}</p>
          </div>

          <Separator />

          {/* Requirements */}
          <div>
            <h3 className="mb-3 font-semibold">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-600" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{job.applicants} applicants</span>
            </div>
            <span>Posted on {postedDate}</span>
          </div>

          {/* Apply Button */}
          <Button className="gradient-primary w-full text-white" size="lg">
            <Briefcase className="mr-2 h-5 w-5" />
            Apply for this Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
