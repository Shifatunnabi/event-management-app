interface AdPlaceholderProps {
  width?: string | number
  height?: string | number
  size?: "small" | "medium" | "large" | "banner"
  className?: string
  title?: string
}

export default function AdPlaceholder({ 
  width, 
  height, 
  size = "medium",
  className = "",
  title = "Premium Ad Space"
}: AdPlaceholderProps) {
  // Default sizes based on common ad dimensions
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-[300px] h-[250px]"
      case "medium":
        return "w-[728px] h-[90px]" // Leaderboard
      case "large":
        return "w-[336px] h-[280px]" // Large rectangle
      case "banner":
        return "w-full h-[200px]" // Full width banner
      default:
        return "w-[300px] h-[250px]"
    }
  }

  const sizeClasses = getSizeClasses()
  
  // Custom dimensions override size classes
  const customStyle = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  }

  return (
    <div 
      className={`
        ${!width && !height ? sizeClasses : 'w-full h-full'} 
        bg-linear-to-br from-yellow-100 to-yellow-200 
        border-2 border-dashed border-yellow-400 
        rounded-lg 
        flex flex-col items-center justify-center 
        text-center 
        p-4
        transition-all duration-300 hover:shadow-lg
        ${className}
      `}
      style={customStyle}
    >
      <div className="text-yellow-700 font-semibold text-sm uppercase tracking-wide mb-2">
        Advertisement
      </div>
      <div className="text-gray-600 font-medium text-lg mb-1">
        {title}
      </div>
      <div className="text-gray-500 text-sm">
        {width && height ? `${width} × ${height} px` : 
         size === "small" ? "300×250 px" :
         size === "medium" ? "728×90 px" :
         size === "large" ? "336×280 px" :
         size === "banner" ? "Full Width" : "300×250 px"}
      </div>
    </div>
  )
}