import { cn } from '@/lib/utils/cn'
import { Check } from 'lucide-react'

const steps = [
  { label: 'Serviço' },
  { label: 'Data e hora' },
  { label: 'Confirmar' },
]

interface BookingStepsProps {
  currentStep: 1 | 2 | 3
}

export function BookingSteps({ currentStep }: BookingStepsProps) {
  return (
    <nav aria-label="Progresso do agendamento" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <li key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isCompleted && 'bg-indigo-600 text-white',
                    isCurrent && 'border-2 border-indigo-600 bg-white text-indigo-600',
                    !isCompleted && !isCurrent && 'border-2 border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block',
                    isCurrent ? 'text-indigo-600' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 transition-colors',
                    stepNumber < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
