'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  isPast,
  startOfDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { AvailabilitySlot } from '@/types/app.types'

interface DatePickerProps {
  slots: AvailabilitySlot[]
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  month: Date
  onMonthChange: (month: Date) => void
}

export function DatePicker({ slots, selectedDate, onDateSelect, month, onMonthChange }: DatePickerProps) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const startDayOfWeek = getDay(startOfMonth(month)) // 0 = Sunday

  const datesWithSlots = new Set(
    slots.map((s) => format(new Date(s.starts_at), 'yyyy-MM-dd'))
  )

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => onMonthChange(subMonths(month, 1))}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-semibold text-gray-900 capitalize">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const hasSlots = datesWithSlots.has(dateKey)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isPastDay = isPast(startOfDay(day)) && !isToday(day)
          const isDisabled = isPastDay || !hasSlots

          return (
            <button
              key={dateKey}
              onClick={() => !isDisabled && onDateSelect(day)}
              disabled={isDisabled}
              className={cn(
                'relative flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors',
                isSelected && 'bg-indigo-600 text-white',
                !isSelected && isToday(day) && 'border border-indigo-400 text-indigo-600',
                !isSelected && !isToday(day) && hasSlots && !isPastDay && 'text-gray-900 hover:bg-indigo-50',
                isDisabled && 'cursor-not-allowed text-gray-300'
              )}
              aria-label={format(day, 'dd/MM/yyyy')}
            >
              {format(day, 'd')}
              {hasSlots && !isPastDay && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
