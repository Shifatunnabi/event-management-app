"use client"

import { useState } from "react"
import { Calendar, MapPin, Clock, DollarSign, Users, Briefcase } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import JobApplicationModal from "./job-application-modal"
import type { Job } from "@/data/jobs"

interface JobCardProps {
  job: Job
  onViewDetails: (job: Job) => void
  onApplicationSuccess?: () => void
}

export default function JobCard({ job, onViewDetails, onApplicationSuccess }: JobCardProps) {
  const [applicationModalOpen, setApplicationModalOpen] = useState(false)
  
  const formattedDate = new Date(job.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const handleApplicationSuccess = () => {
    if (onApplicationSuccess) {
      onApplicationSuccess()
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-xl font-bold">{job.title}</h3>
            <p className="mb-2 text-sm text-muted-foreground">{job.eventName}</p>
            <p className="text-sm font-medium text-purple-600">{job.organizer}</p>
          </div>
          <Badge variant="secondary">{job.type}</Badge>
        </div>

        <div className="mb-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{job.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{job.applicants} applicants</span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

        <div className="flex gap-2">
          <Button onClick={() => onViewDetails(job)} variant="outline" className="flex-1 bg-transparent">
            View Details
          </Button>
          <Button className="bg-[#ff7c07] hover:bg-[#e66f06] flex-1 text-white" onClick={() => setApplicationModalOpen(true)}>
            <Briefcase className="mr-2 h-4 w-4" />
            Apply Now
          </Button>
        </div>
      </CardContent>

      {/* Application Modal */}
      <JobApplicationModal
        jobId={job.id}
        jobTitle={job.title}
        open={applicationModalOpen}
        onOpenChange={setApplicationModalOpen}
        onSuccess={handleApplicationSuccess}
      />
    </Card>
  )
}
