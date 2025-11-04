"use client"

import Link from "next/link"
import { categories } from "@/data/categories"

export default function CategoryBadges() {
  const duplicatedCategories = [...categories, ...categories, ...categories]

  return (
    <div className="relative w-full">
      <div className="flex animate-scroll gap-3 md:gap-6">
        {duplicatedCategories.map((category, index) => {
          const Icon = category.icon
          return (
            <Link
              key={`${category.id}-${index}`}
              href={`/`}
              className="group flex min-w-[120px] flex-col items-center gap-3 transition-transform hover:scale-110"
            >
              <div className="flex h-8 w-8 md:h-16 md:w-16 items-center justify-center rounded-full bg-white shadow-md transition-shadow group-hover:shadow-lg">
                <Icon className="h-4 w-4 md:h-8 md:w-8 text-gray-800" />
              </div>
              <span className="text-center text-sm font-medium text-gray-800 whitespace-nowrap">{category.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
