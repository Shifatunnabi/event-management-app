import { ReactNode } from "react"

interface MainContainerProps {
  children: ReactNode
  className?: string
}

export default function MainContainer({ children, className = "" }: MainContainerProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile and Tablet: Full width with padding */}
      <div className="lg:hidden px-4 sm:px-6 md:px-8">
        {children}
      </div>
      
      {/* Desktop and larger: 16-grid system with 2 empty grids on each side */}
      <div className="hidden lg:block w-full">
        <div className="lg:grid lg:grid-cols-16 lg:gap-0 w-full">
          {/* Left empty space - 2 grids */}
          <div className="col-span-2"></div>
          
          {/* Main content - 12 grids */}
          <div className="col-span-12 px-4">
            {children}
          </div>
          
          {/* Right empty space - 2 grids */}
          <div className="col-span-2"></div>
        </div>
      </div>
    </div>
  )
}