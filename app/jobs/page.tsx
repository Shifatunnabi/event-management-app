"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import JobCard from "@/components/jobs/job-card"
import JobDetailsModal from "@/components/jobs/job-details-modal"
import { jobs } from "@/data/jobs"
import type { Job } from "@/data/jobs"

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const jobTypes = ["All Types", "Freelance", "Contract", "Part-time", "Full-time"]

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.eventName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "All Types" || job.type === selectedType
    return matchesSearch && matchesType
  })

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setDetailsModalOpen(true)
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-center text-4xl font-bold">Job Portal</h1>
            <p className="text-center text-muted-foreground">Find exciting gig opportunities at upcoming events</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search jobs by title or event name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {jobTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type ? "bg-[#ff7c07] text-white" : "bg-transparent"}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />)
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <JobDetailsModal job={selectedJob} open={detailsModalOpen} onOpenChange={setDetailsModalOpen} />
    </>
  )
}
