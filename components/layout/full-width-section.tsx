import { ReactNode } from "react"

interface FullWidthSectionProps {
  children: ReactNode
  className?: string
  backgroundClassName?: string
}

export default function FullWidthSection({ 
  children, 
  className = "", 
  backgroundClassName = "" 
}: FullWidthSectionProps) {
  return (
    <div className={`w-full ${backgroundClassName}`}>
      {/* Mobile and Tablet: Full width with padding */}
      <div className="lg:hidden px-4 sm:px-6 md:px-8">
        <div className={className}>
          {children}
        </div>
      </div>
      
      {/* Desktop and larger: 16-grid system with 2 empty grids on each side */}
      <div className="hidden lg:block w-full">
        <div className="lg:grid lg:grid-cols-16 lg:gap-0 w-full">
          {/* Left empty space - 2 grids */}
          <div className="col-span-2"></div>
          
          {/* Main content - 12 grids */}
          <div className={`col-span-12 px-4 ${className}`}>
            {children}
          </div>
          
          {/* Right empty space - 2 grids */}
          <div className="col-span-2"></div>
        </div>
      </div>
    </div>
  )
}