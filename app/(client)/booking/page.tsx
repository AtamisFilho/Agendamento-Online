'use client'

import { useRouter } from 'next/navigation'
import { BookingSteps } from '@/components/booking/BookingSteps'
import { ServiceCard } from '@/components/booking/ServiceCard'
import { useServices } from '@/lib/hooks/useServices'
import { PageSpinner } from '@/components/ui/Spinner'
import type { Service } from '@/types/app.types'

export default function BookingServicesPage() {
  const router = useRouter()
  const { services, loading } = useServices()

  const handleSelect = (service: Service) => {
    router.push(`/booking/${service.id}`)
  }

  return (
    <div>
      <BookingSteps currentStep={1} />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Escolha o serviço</h1>
      <p className="mb-6 text-sm text-gray-500">
        Selecione o serviço que deseja agendar.
      </p>

      {loading ? (
        <PageSpinner />
      ) : services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
          <p className="text-sm text-gray-500">Nenhum serviço disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  )
}
