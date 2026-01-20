"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Calendar, MapPin, Clock, Users, Mail, Phone, Briefcase, User, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Job {
  _id: string
  title: string
  eventName?: string
  location: string
  date: string
  duration: string
  salary: string
  type: string
  description: string
  applicants: number
  status: string
}

interface Application {
  _id: string
  userName: string
  userEmail: string
  userPhone?: string
  occupation: string
  age: number
  dateOfBirth: string
  gender: string
  address: string
  experienceYears: number
  experienceDetails: string
  status: string
  appliedAt: string
}

export default function JobDetailsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const jobId = searchParams?.get("jobId")

  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({})

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  useEffect(() => {
    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organizers/jobs/${jobId}/applications`)
      const data = await response.json()

      if (data.success) {
        setJob(data.job)
        setApplications(data.applications)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load job details",
          variant: "destructive",
          duration: 2000,
        })
      }
    } catch (error) {
      console.error("Error fetching job details:", error)
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
        duration: 2000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!jobId) {
    return (
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <p className="text-center text-muted-foreground">Job not found</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <p className="text-center text-muted-foreground">Job not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 md:p-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Jobs
      </Button>

      {/* Job Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl mb-2">{job.title}</CardTitle>
              {job.eventName && (
                <p className="text-muted-foreground mb-4">Event: {job.eventName}</p>
              )}
            </div>
            <Badge variant={job.status === "OPEN" ? "default" : "secondary"} className="self-start">
              {job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Starting Date</p>
                <p className="font-medium">
                  {new Date(job.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium">{job.duration}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <span className="text-sm font-semibold text-orange-600">BDT</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="font-medium">{job.salary}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Job Type</h3>
              <Badge variant="secondary">{job.type}</Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{job.applicants} Total Applicants</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Job Applicants ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
            <div className="grid gap-4">
              {applications.map((app) => {
                const isExpanded = expandedCards[app._id]
                
                return (
                  <Card key={app._id} className="border-2">
                    <CardContent className="p-4 md:p-6">
                      <div className="space-y-4">
                        {/* Applicant Header - Always Visible */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <h3 className="text-lg font-semibold">{app.userName}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.occupation}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleCard(app._id)}
                              className="flex items-center gap-2"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Collapse
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Expand
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {isExpanded && (
                          <>
                            <div className="pt-4 border-t" />
                            
                            {/* Contact Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground">Email</p>
                                  <p className="text-sm truncate">{app.userEmail}</p>
                                </div>
                              </div>

                              {app.userPhone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="text-sm">{app.userPhone}</p>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Age & Gender</p>
                                  <p className="text-sm">{app.age} years, {app.gender}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                                  <p className="text-sm">
                                    {new Date(app.dateOfBirth).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Address */}
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Address</p>
                              <p className="text-sm">{app.address}</p>
                            </div>

                            {/* Experience */}
                            <div className="pt-4 border-t">
                              <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <p className="font-medium">
                                  Experience: {app.experienceYears} year{app.experienceYears !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.experienceDetails}</p>
                            </div>

                            {/* Applied Date */}
                            <div className="pt-4 border-t text-xs text-muted-foreground">
                              Applied on{" "}
                              {new Date(app.appliedAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-muted-foreground mb-2">No applications yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                When people apply for this job, their applications will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
