'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface CancelModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}

export function CancelModal({ open, onClose, onConfirm }: CancelModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm(reason)
    setLoading(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Cancelar agendamento">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
        </p>

        <div>
          <label htmlFor="cancel-reason" className="text-sm font-medium text-gray-700">
            Motivo (opcional)
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Informe o motivo do cancelamento..."
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Manter agendamento
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading} className="flex-1">
            Cancelar agendamento
          </Button>
        </div>
      </div>
    </Modal>
  )
}
