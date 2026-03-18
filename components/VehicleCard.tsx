'use client'

import { Car, Bike, Zap, AlertCircle } from 'lucide-react'
import type { Vehicle } from '@/lib/store'
import { needsOdometerUpdate } from '@/lib/store'
import { cn } from '@/lib/utils'

const vehicleIcons = {
  car: Car,
  bike: Bike,
  scooty: Bike,
  others: Car,
}

const fuelBadge = {
  petrol: { label: 'Petrol', bg: 'bg-[oklch(0.93_0.06_250)]', text: 'text-[oklch(0.38_0.12_250)]' },
  diesel: { label: 'Diesel', bg: 'bg-[oklch(0.93_0.05_60)]', text: 'text-[oklch(0.42_0.10_60)]' },
  'petrol+cng': { label: 'Petrol + CNG', bg: 'bg-[oklch(0.93_0.05_145)]', text: 'text-[oklch(0.36_0.09_145)]' },
  electric: { label: 'Electric', bg: 'bg-[oklch(0.93_0.05_180)]', text: 'text-[oklch(0.36_0.09_180)]' },
}

interface VehicleCardProps {
  vehicle: Vehicle
  onClick: () => void
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const Icon = vehicleIcons[vehicle.type] || Car
  const badge = fuelBadge[vehicle.fuelType]
  const isElectric = vehicle.fuelType === 'electric'
  const pendingUpdate = needsOdometerUpdate(vehicle)

  return (
    <button
      onClick={onClick}
      className="clay-card w-full text-left p-5 flex items-center gap-4 active:scale-[0.98] transition-transform duration-150"
    >
      {/* Vehicle type icon */}
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
          isElectric ? 'bg-[oklch(0.93_0.05_180)]' : 'bg-secondary'
        )}
      >
        {isElectric
          ? <Zap size={24} strokeWidth={1.75} className="text-[oklch(0.36_0.09_180)]" />
          : <Icon size={24} strokeWidth={1.75} className="text-primary" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-foreground text-base leading-tight truncate">{vehicle.name}</h3>
          {pendingUpdate && (
            <div className="flex items-center gap-1 bg-[oklch(0.95_0.05_25)] text-[oklch(0.45_0.18_25)] text-[10px] font-semibold px-2 py-1 rounded-full shrink-0">
              <AlertCircle size={10} strokeWidth={2} />
              Pending
            </div>
          )}
        </div>
        <p className="text-muted-foreground text-xs mt-0.5 truncate">{vehicle.brand} {vehicle.model}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-full', badge.bg, badge.text)}>
            {badge.label}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {vehicle.currentOdometer.toLocaleString('en-IN')} km
          </span>
        </div>
      </div>
    </button>
  )
}
