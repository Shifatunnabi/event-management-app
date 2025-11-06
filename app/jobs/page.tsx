"use client"

import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import JobCard from "@/components/jobs/job-card"
import JobDetailsModal from "@/components/jobs/job-details-modal"
import type { Job } from "@/data/jobs"

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const jobTypes = ["All Types", "Freelance", "Contract", "Part-time", "Full-time"]

  useEffect(() => {
    fetchJobs()
  }, [selectedType, searchQuery])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedType !== "All Types") {
        params.append("type", selectedType)
      }
      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        // Transform API data to match Job interface
        const transformedJobs = data.jobs.map((job: any) => ({
          id: job._id,
          title: job.title,
          eventName: job.eventName || "",
          organizer: job.organizerName,
          location: job.location,
          date: job.date,
          duration: job.duration,
          salary: job.salary,
          type: job.type,
          description: job.description,
          requirements: job.requirements || [],
          applicants: job.applicants || 0,
          postedDate: job.postedDate,
        }))
        setJobs(transformedJobs)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setDetailsModalOpen(true)
  }

  const handleApplicationSuccess = () => {
    // Refresh jobs to update applicant count
    fetchJobs()
  }

  return (
    <>
      <div className="min-h-screen">
        <div className="py-8">
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
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={handleViewDetails}
                  onApplicationSuccess={handleApplicationSuccess}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <JobDetailsModal
        job={selectedJob}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onApplicationSuccess={handleApplicationSuccess}
      />
    </>
  )
}
