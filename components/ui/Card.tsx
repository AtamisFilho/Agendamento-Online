import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-4 shadow-sm',
        onClick && 'cursor-pointer transition-shadow hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  )
}
