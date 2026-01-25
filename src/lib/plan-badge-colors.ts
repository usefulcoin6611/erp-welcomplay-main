/**
 * Get badge color classes based on plan name
 * @param planName - The name of the pricing plan
 * @returns Tailwind CSS classes for badge styling
 */
export function getPlanBadgeColors(planName: string): string {
  const normalizedName = planName.toLowerCase().trim()
  
  switch (normalizedName) {
    case 'free plan':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    
    case 'silver':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    
    case 'gold':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    
    case 'platinum':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

/**
 * Get badge color classes for solid background (for card badges)
 * @param planName - The name of the pricing plan
 * @returns Tailwind CSS classes for badge styling with solid background
 */
export function getPlanBadgeColorsSolid(planName: string): string {
  const normalizedName = planName.toLowerCase().trim()
  
  switch (normalizedName) {
    case 'free plan':
      return 'bg-gray-500 text-white'
    
    case 'silver':
      return 'bg-indigo-500 text-white'
    
    case 'gold':
      return 'bg-amber-500 text-white'
    
    case 'platinum':
      return 'bg-purple-500 text-white'
    
    default:
      return 'bg-gray-500 text-white'
  }
}
