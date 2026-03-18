'use client'

import { useState } from 'react'
import { Gauge, X, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import type { Vehicle } from '@/lib/store'

interface OdometerReminderProps {
  vehicles: Vehicle[]
  onDismiss: () => void
}

export function OdometerReminder({ vehicles, onDismiss }: OdometerReminderProps) {
  const { updateOdometer } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const vehicle = vehicles[currentIndex]
  if (!vehicle) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = Number(value)
    if (!value || isNaN(num)) { setError('Please enter a valid odometer reading'); return }
    if (num < vehicle.currentOdometer) {
      setError('Entered odometer is less than previous. Please enter a valid reading.')
      return
    }
    updateOdometer(vehicle.id, num)
    toast(`Odometer updated for ${vehicle.name}`)
    if (currentIndex + 1 < vehicles.length) {
      setCurrentIndex(prev => prev + 1)
      setValue('')
      setError('')
    } else {
      onDismiss()
    }
  }

  function handleSkip() {
    if (currentIndex + 1 < vehicles.length) {
      setCurrentIndex(prev => prev + 1)
      setValue('')
      setError('')
    } else {
      onDismiss()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-[2px]">
      <div
        className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-8"
        style={{ boxShadow: '0 -8px 40px oklch(0.22 0.01 260 / 0.14)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[oklch(0.95_0.05_25)] flex items-center justify-center">
              <Gauge size={18} strokeWidth={1.75} className="text-[oklch(0.45_0.18_25)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">Odometer Update</h2>
              {vehicles.length > 1 && (
                <p className="text-xs text-muted-foreground">{currentIndex + 1} of {vehicles.length} vehicles</p>
              )}
            </div>
          </div>
          <button onClick={onDismiss} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X size={15} strokeWidth={2} className="text-foreground" />
          </button>
        </div>

        <p className="text-foreground font-semibold text-sm mb-1">{vehicle.name}</p>
        <p className="text-muted-foreground text-xs mb-5 leading-relaxed">
          Last recorded: <span className="font-semibold text-foreground">{vehicle.currentOdometer.toLocaleString('en-IN')} km</span>
          {' '}· Please enter today's reading.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="number"
              value={value}
              onChange={e => { setValue(e.target.value); setError('') }}
              placeholder={`Enter km (min ${vehicle.currentOdometer.toLocaleString('en-IN')})`}
              className="w-full px-4 py-3.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              autoFocus
            />
            {error && (
              <div className="flex items-start gap-1.5 mt-2">
                <AlertTriangle size={12} strokeWidth={2} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-destructive text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}
            {!error && (
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                To correct an old value, update it from Vehicle Details.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-muted-foreground text-sm bg-secondary transition-all active:scale-95"
            >
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl font-bold text-white text-sm transition-all active:scale-95"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
