import { ReactNode } from "react"

interface BreakoutSectionProps {
  children: ReactNode
  className?: string
}

export default function BreakoutSection({ children, className = "" }: BreakoutSectionProps) {
  return (
    <div className={`w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] ${className}`}>
      {children}
    </div>
  )
}