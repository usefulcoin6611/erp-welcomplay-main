'use client'

import { Star } from 'lucide-react'

type StarRatingDisplayProps = {
  rating: number
  maxStars?: number
  showValue?: boolean
  className?: string
}

/**
 * Menampilkan rating dalam bentuk bintang (1–5) dengan gaya konsisten
 * di seluruh tab Performance: Indicator, Appraisal, Goal Tracking.
 */
export function StarRatingDisplay({
  rating,
  maxStars = 5,
  showValue = true,
  className = '',
}: StarRatingDisplayProps) {
  const value = Math.min(maxStars, Math.max(0, Number(rating)))
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 shrink-0 ${i < value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">({value.toFixed(1)})</span>
      )}
    </span>
  )
}
