import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function OrganizerCTA() {
  return (
    <section className="bg-[#ff7c07] mt-16 rounded-2xl py-20">
      <div className="px-4 text-center">
        <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">Want to organize your own Event?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
          Join thousands of event organizers who trust EventGhor to create, manage, and promote their events. Start your
          journey today and bring your vision to life.
        </p>
        <Button asChild size="lg" className="group bg-white text-[#ff7c07] hover:bg-white/90">
          <Link href="/organizer/create-event" className="flex items-center gap-2">
            Try EventGhor
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
