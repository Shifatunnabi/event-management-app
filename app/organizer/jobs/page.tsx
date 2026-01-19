"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Job {
  _id: string
  title: string
  eventName: string
  location: string
  date: string
  duration: string
  salary: string
  type: string
  description: string
  applicants: number
  status: string
}

export default function JobsBoardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    eventName: "",
    location: "",
    date: "",
    duration: "",
    salary: "",
    type: "Freelance",
    description: "",
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/organizers/jobs")
      const data = await response.json()

      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.location || !formData.date || !formData.duration || !formData.salary || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const url = editingJob
        ? `/api/organizers/jobs/${editingJob._id}`
        : "/api/organizers/jobs"
      const method = editingJob ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: editingJob ? "Job updated successfully" : "Job posted successfully",
        })
        setCreateModalOpen(false)
        setEditModalOpen(false)
        resetForm()
        fetchJobs()
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      eventName: job.eventName || "",
      location: job.location,
      date: job.date.split("T")[0],
      duration: job.duration,
      salary: job.salary,
      type: job.type,
      description: job.description,
    })
    setEditModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteJobId) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/organizers/jobs/${deleteJobId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Job deleted successfully",
        })
        fetchJobs()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteJobId(null)
    }
  }

  const handleViewDetails = (jobId: string) => {
    router.push(`/organizer/job-details?jobId=${jobId}`)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      eventName: "",
      location: "",
      date: "",
      duration: "",
      salary: "",
      type: "Freelance",
      description: "",
    })
    setEditingJob(null)
  }

  const handleCreateModalClose = (open: boolean) => {
    setCreateModalOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleEditModalClose = (open: boolean) => {
    setEditModalOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <>
      <div className="container mx-auto max-w-6xl p-4 md:p-8">
        <div className="mb-4">
          <h1 className="mb-2 text-2xl md:text-4xl text-center font-bold">Jobs Board Management</h1>
          <p className="text-muted-foreground text-center">Post and manage job opportunities for your events</p>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#ff7c07] hover:bg-[#e66f06] text-white w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Posted Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold truncate">{job.title}</h3>
                        <Badge variant={job.status === "OPEN" ? "default" : "secondary"}>
                          {job.status}
                        </Badge>
                      </div>
                      {job.eventName && (
                        <p className="text-sm text-muted-foreground mb-1">Event: {job.eventName}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {job.applicants} applicant{job.applicants !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(job)}
                        className="flex-1 sm:flex-initial"
                      >
                        <Edit className="h-4 w-4 mr-1 sm:mr-0" />
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteJobId(job._id)}
                        className="text-red-600 hover:text-red-700 flex-1 sm:flex-initial"
                      >
                        <Trash2 className="h-4 w-4 mr-1 sm:mr-0" />
                        <span className="sm:hidden">Delete</span>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleViewDetails(job._id)}
                        className="bg-[#ff7c07] hover:bg-[#e66f06] flex-1 sm:flex-initial"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span>Show Applicants</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-semibold text-muted-foreground mb-2">No jobs posted yet</p>
                <p className="text-sm text-muted-foreground">Click the button above to post your first job</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Job Modal */}
      <Dialog open={createModalOpen} onOpenChange={handleCreateModalClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Post New Job</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Event Photographer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name (Optional)</Label>
              <Input
                id="eventName"
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Dhaka, Bangladesh"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">
                Starting Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                placeholder="e.g., 1 Day, 3 Days, 1 Week"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">
                Salary Range <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary"
                placeholder="e.g., ৳5000 - ৳8000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Describe the job responsibilities..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-[#ff7c07] hover:bg-[#e66f06] w-full text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <Dialog open={editModalOpen} onOpenChange={handleEditModalClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Job</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editJobTitle">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editJobTitle"
                placeholder="e.g., Event Photographer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEventName">Event Name (Optional)</Label>
              <Input
                id="editEventName"
                placeholder="Enter event name"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLocation">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editLocation"
                placeholder="e.g., Dhaka, Bangladesh"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDate">
                Starting Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editDate"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDuration">
                Duration <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editDuration"
                placeholder="e.g., 1 Day, 3 Days, 1 Week"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSalary">
                Salary Range <span className="text-red-500">*</span>
              </Label>
              <Input
                id="editSalary"
                placeholder="e.g., ৳5000 - ৳8000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editType">
                Job Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editJobDescription">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="editJobDescription"
                placeholder="Describe the job responsibilities..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-[#ff7c07] hover:bg-[#e66f06] w-full text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Job"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job and all applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

