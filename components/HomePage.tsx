'use client'

import { Plus, Car, UserCircle } from 'lucide-react'
import { useApp } from '@/lib/context'
import { isReminderUpcoming, isReminderOverdue } from '@/lib/store'
import { VehicleCard } from './VehicleCard'

interface HomePageProps {
  onSelectVehicle: (vehicleId: string, tab?: string) => void
  onGoToSettings: () => void
  onAddVehicle: () => void
}

export function HomePage({ onSelectVehicle, onGoToSettings, onAddVehicle }: HomePageProps) {
  const { data } = useApp()

  const firstName = data.userName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{greeting},</p>
          <h1 className="text-2xl font-bold text-foreground text-balance">{firstName}</h1>
        </div>
        <button
          onClick={onGoToSettings}
          className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-clay)' }}
          aria-label="Go to settings"
        >
          <UserCircle size={22} strokeWidth={1.75} className="text-foreground" />
        </button>
      </div>

      {/* Vehicles section */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground">My Vehicles</h2>
          <span className="text-xs text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full">
            {data.vehicles.length} {data.vehicles.length === 1 ? 'vehicle' : 'vehicles'}
          </span>
        </div>

        {data.vehicles.length === 0 ? (
          <div
            className="clay-card p-10 flex flex-col items-center gap-4 text-center"
            role="region"
            aria-label="No vehicles added"
          >
            <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center">
              <Car size={28} strokeWidth={1.5} className="text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground mb-1">No vehicles yet</p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tap the + button below to add your first vehicle.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-36">
            {data.vehicles.sort((a, b) => {
              // Get reminders for each vehicle
              const aReminders = data.reminders.filter(r => r.vehicleId === a.id && !r.isCompleted)
              const bReminders = data.reminders.filter(r => r.vehicleId === b.id && !r.isCompleted)
              
              // Check for overdue reminders (higher priority)
              const aHasOverdue = aReminders.some(isReminderOverdue)
              const bHasOverdue = bReminders.some(isReminderOverdue)
              
              if (aHasOverdue && !bHasOverdue) return -1
              if (!aHasOverdue && bHasOverdue) return 1
              
              // Check for upcoming reminders (within 3 days)
              const aHasUpcoming = aReminders.some(r => isReminderUpcoming(r, 3))
              const bHasUpcoming = bReminders.some(r => isReminderUpcoming(r, 3))
              
              if (aHasUpcoming && !bHasUpcoming) return -1
              if (!aHasUpcoming && bHasUpcoming) return 1
              
              return 0
            }).map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                reminders={data.reminders.filter(r => r.vehicleId === vehicle.id && !r.isCompleted)}
                documents={data.documents.filter(d => d.vehicleId === vehicle.id)}
                onClick={() => onSelectVehicle(vehicle.id)}
                onNavigateToReminders={() => onSelectVehicle(vehicle.id, 'reminders')}
                onNavigateToDocuments={() => onSelectVehicle(vehicle.id, 'documents')}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onAddVehicle}
        className="fixed bottom-28 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
        style={{
          background: 'oklch(0.55 0.18 250)',
          boxShadow: '0 6px 24px oklch(0.55 0.18 250 / 0.45)',
        }}
        aria-label="Add new vehicle"
      >
        <Plus size={24} strokeWidth={2} />
      </button>
    </div>
  )
}
