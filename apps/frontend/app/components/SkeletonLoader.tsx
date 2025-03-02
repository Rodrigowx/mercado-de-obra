import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonLoaderProps {
  className?: string
  count?: number
}

export default function SkeletonLoader({
  className = "",
  count = 1,
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={`mt-4 rounded-md ${className}`}
        />
      ))}
    </>
  )
}
