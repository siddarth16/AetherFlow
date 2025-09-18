import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function downloadFile(data: string | Blob, filename: string, type: string) {
  const blob = data instanceof Blob ? data : new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export function calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export function getNodeIcon(type: string): string {
  switch (type) {
    case 'idea':
      return '💡'
    case 'task':
      return '✅'
    case 'note':
      return '📝'
    default:
      return '◯'
  }
}

export function calculateNodeSize(title: string, description?: string): { width: number; height: number } {
  // Estimate text width based on character count
  const titleLength = title.length
  const descLength = description?.length || 0

  // Base dimensions
  let width = Math.max(200, titleLength * 8 + 40) // Min 200px, ~8px per char + padding
  let height = 120 // Base height

  // Adjust for description
  if (description && descLength > 0) {
    const descLines = Math.ceil(descLength / 30) // ~30 chars per line
    height += descLines * 20 // ~20px per line
  }

  // Adjust for long titles
  if (titleLength > 25) {
    const titleLines = Math.ceil(titleLength / 25)
    height += (titleLines - 1) * 24 // ~24px per title line
  }

  // Max constraints
  width = Math.min(width, 400)
  height = Math.min(height, 200)

  return { width, height }
}

export function findNonOverlappingPosition(
  parentPosition: { x: number; y: number },
  existingNodes: Array<{ position: { x: number; y: number }; title: string; description?: string }>,
  nodeIndex: number,
  totalSiblings: number
): { x: number; y: number } {
  const baseDistance = 250
  const angle = (2 * Math.PI * nodeIndex) / totalSiblings

  // Calculate ideal position in circle around parent
  let x = parentPosition.x + Math.cos(angle) * baseDistance
  let y = parentPosition.y + Math.sin(angle) * baseDistance

  // Check for overlaps and adjust
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    let hasOverlap = false

    for (const existingNode of existingNodes) {
      const distance = calculateDistance({ x, y }, existingNode.position)
      if (distance < 200) { // Minimum distance between nodes
        hasOverlap = true
        break
      }
    }

    if (!hasOverlap) {
      break
    }

    // Adjust position by moving further out
    const newDistance = baseDistance + (attempts + 1) * 100
    x = parentPosition.x + Math.cos(angle) * newDistance
    y = parentPosition.y + Math.sin(angle) * newDistance

    attempts++
  }

  return { x, y }
}