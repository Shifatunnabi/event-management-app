import Link from "next/link"

export default function EventOrganizerCard() {
  return (
    <div className="flex h-full flex-row overflow-hidden rounded-2xl bg-white shadow-lg lg:flex-col">
      {/* Photo Section - Top on desktop, Left on mobile */}
      <div className="relative w-2/5 overflow-hidden lg:h-3/5 lg:w-full">
        <div
          className="h-full w-full bg-cover bg-center transition-transform hover:scale-105"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?cs=srgb&dl=pexels-wolfgang-1002140-2747449.jpg&fm=jpg)",
            backgroundPosition: "center",
          }}
        >
          {/* Event Organizer text overlay */}
          <div className="flex h-full items-start justify-center bg-black/30 p-4 lg:items-center">
            <h3 className="text-center text-xl font-bold text-amber-400 md:text-2xl">Are you an Event Organizer?</h3>
          </div>
        </div>
      </div>

      {/* Text Section - Bottom on desktop, Right on mobile */}
      
      <div className="flex w-3/5 items-center justify-center bg-gradient-to-br from-teal-700 to-teal-900 p-6 lg:h-2/5 lg:w-full">
        <Link href={`/organizer/create-event`}>
          <div className="flex items-center gap-3">
            <p className="text-base font-semibold leading-relaxed text-white md:text-lg">
              Organize Your event by taking services from EventGhor.
            </p>
            <svg className="h-6 w-6 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
      
    </div>
  )
}
