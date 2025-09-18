import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <div className={cn(
          "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
          sizeClasses[size]
        )} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse-soft">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 'md', className }: Omit<LoadingProps, 'text'>) {
  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
      sizeClasses[size],
      className
    )} />
  )
}