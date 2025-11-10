// Simple in-memory queue for development
// In production, you should use Bull with Redis

interface EmailJob {
  id: string;
  data: {
    userId: string;
    userEmail: string;
    userName: string;
    tickets: any[];
    eventDetails: any;
  };
  attempts: number;
  maxAttempts: number;
  status: "pending" | "processing" | "completed" | "failed";
}

class SimpleEmailQueue {
  private queue: EmailJob[] = [];
  private processing = false;

  async add(data: EmailJob["data"]): Promise<string> {
    const job: EmailJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data,
      attempts: 0,
      maxAttempts: 3,
      status: "pending",
    };

    this.queue.push(job);
    
    // Start processing if not already processing
    if (!this.processing) {
      this.processQueue();
    }

    return job.id;
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.find((j) => j.status === "pending");
      if (!job) break;

      job.status = "processing";
      job.attempts++;

      try {
        // Dynamic import to avoid circular dependencies
        const { sendTicketEmail } = await import("@/lib/email/ticketEmail");
        await sendTicketEmail(
          job.data.userEmail,
          job.data.userName,
          job.data.tickets,
          job.data.eventDetails
        );

        job.status = "completed";
        console.log(`✅ Email sent successfully to ${job.data.userEmail}`);
      } catch (error) {
        console.error(`❌ Email send failed (attempt ${job.attempts}):`, error);

        if (job.attempts >= job.maxAttempts) {
          job.status = "failed";
          console.error(`❌ Email job ${job.id} failed after ${job.maxAttempts} attempts`);
        } else {
          job.status = "pending";
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    // Clean up completed/failed jobs
    this.queue = this.queue.filter(
      (j) => j.status === "pending" || j.status === "processing"
    );

    this.processing = false;
  }

  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter((j) => j.status === "pending").length,
      processing: this.queue.filter((j) => j.status === "processing").length,
      completed: this.queue.filter((j) => j.status === "completed").length,
      failed: this.queue.filter((j) => j.status === "failed").length,
    };
  }
}

// Singleton instance
const emailQueue = new SimpleEmailQueue();

export default emailQueue;

export async function queueTicketEmail(
  userId: string,
  userEmail: string,
  userName: string,
  tickets: any[],
  eventDetails: any
) {
  const jobId = await emailQueue.add({
    userId,
    userEmail,
    userName,
    tickets,
    eventDetails,
  });

  console.log(`📧 Email job queued: ${jobId} for ${userEmail}`);
  return jobId;
}
