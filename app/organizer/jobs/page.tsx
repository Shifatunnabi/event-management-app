"use client"

import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function JobsBoardPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const postedJobs = [
    { id: "J001", title: "Event Photographer", applicants: 23, status: "Active" },
    { id: "J002", title: "Stage Manager", applicants: 15, status: "Active" },
    { id: "J003", title: "Sound Engineer", applicants: 12, status: "Closed" },
  ]

  return (
    <>
      <div className="container mx-auto p-8">
        

          <div className="mb-4">
            <h1 className="mb-2 text-2xl md:text-4xl text-center font-bold">Jobs Board Management</h1>
            <p className="text-muted-foreground text-center">Post and manage job opportunities for your events</p>
          </div>
          
          <div className="mb-4 text-center ">
            <Button onClick={() => setCreateModalOpen(true)} className="bg-[#ff7c07] hover:bg-[#e66f06] text-white w-full">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </div>
        

        <Card>
          <CardHeader>
            <CardTitle>Posted Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {postedJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-semibold">{job.title}</h3>
                      <Badge variant={job.status === "Active" ? "default" : "secondary"}>{job.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Job ID: {job.id}</p>
                    <p className="text-sm text-muted-foreground">{job.applicants} applicants</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Job Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Post New Job</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" placeholder="e.g., Event Photographer" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name</Label>
              <Input id="eventName" placeholder="Select or enter event name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input id="salary" placeholder="e.g., $500 - $800" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" placeholder="e.g., 1 Day, 3 Days" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description</Label>
              <Textarea id="jobDescription" placeholder="Describe the job responsibilities..." rows={4} required />
            </div>
            <Button type="submit" className="gradient-primary w-full text-white">
              Post Job
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
