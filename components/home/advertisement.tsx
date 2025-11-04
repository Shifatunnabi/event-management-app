import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Advertisement() {
  return (
    <section className="bg-white mt-16 rounded-2xl py-20 shadow-sm border">
      <div className="px-4 text-center">
        <div className="mx-auto mb-6 max-w-[640px]">
          <img src="/images/ad-placeholder.png" alt="Sponsor" className="mx-auto h-28 object-contain" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Sponsored: Reach Thousands of Event-Goers</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-700">
          Promote your brand to a highly engaged audience of event attendees. Run targeted campaigns, feature listings,
          and custom sponsorship packages tailored to your goals.
        </p>

        <Button asChild size="lg" className="group bg-[#ff7c07] hover:bg-[#e66f06] text-white">
          <Link href="/advertise" className="flex items-center gap-2">
            Learn More
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
