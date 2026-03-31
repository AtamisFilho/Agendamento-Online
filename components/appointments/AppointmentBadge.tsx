import { Badge } from '@/components/ui/Badge'
import { statusLabels } from '@/lib/utils/formatters'
import type { AppointmentStatus } from '@/types/app.types'

const statusVariants: Record<AppointmentStatus, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled_by_client: 'danger',
  cancelled_by_provider: 'danger',
  completed: 'info',
  no_show: 'gray',
}

export function AppointmentBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge variant={statusVariants[status]}>
      {statusLabels[status]}
    </Badge>
  )
}
