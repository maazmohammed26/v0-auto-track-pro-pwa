'use client'

import { useState } from 'react'
import { Car, Bike, Zap, AlertCircle, Bell, ChevronRight, FileText, Calendar } from 'lucide-react'
import type { Vehicle, Reminder, VehicleDocument } from '@/lib/store'
import { needsOdometerUpdate, isReminderOverdue, isReminderUpcoming, isDocumentExpired, isDocumentExpiringSoon } from '@/lib/store'
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
  reminders: Reminder[]
  documents: VehicleDocument[]
  onClick: () => void
  onNavigateToReminders?: () => void
  onNavigateToDocuments?: () => void
}

export function VehicleCard({ vehicle, reminders, documents, onClick, onNavigateToReminders, onNavigateToDocuments }: VehicleCardProps) {
  const Icon = vehicleIcons[vehicle.type] || Car
  const badge = fuelBadge[vehicle.fuelType]
  const isElectric = vehicle.fuelType === 'electric'
  const pendingUpdate = needsOdometerUpdate(vehicle)
  const [showReminderPopup, setShowReminderPopup] = useState(false)
  const [showDocumentPopup, setShowDocumentPopup] = useState(false)
  
  // Count overdue/expiring items
  const overdueReminders = reminders.filter(isReminderOverdue).length
  const upcomingReminders = reminders.filter(r => isReminderUpcoming(r, 3)).length
  const expiringDocs = documents.filter(d => isDocumentExpired(d) || isDocumentExpiringSoon(d)).length
  const totalAlerts = overdueReminders + expiringDocs
  const hasUpcoming = upcomingReminders > 0 && overdueReminders === 0
  
  const handleReminderClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowReminderPopup(true)
  }
  
  const handleDocumentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDocumentPopup(true)
  }

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
          <div className="flex items-center gap-1.5 shrink-0 relative">
            {hasUpcoming && (
              <button
                onClick={handleReminderClick}
                className="flex items-center gap-1 bg-[oklch(0.93_0.06_250)] text-[oklch(0.38_0.12_250)] text-[10px] font-semibold px-2 py-1 rounded-full hover:opacity-80 transition-opacity"
                title="Reminder due soon - click for details"
              >
                <Bell size={10} strokeWidth={2} />
                {upcomingReminders}
              </button>
            )}
            {totalAlerts > 0 && (
              <button
                onClick={handleDocumentClick}
                className="flex items-center gap-1 bg-[oklch(0.93_0.05_60)] text-[oklch(0.42_0.10_60)] text-[10px] font-semibold px-2 py-1 rounded-full hover:opacity-80 transition-opacity"
                title="Documents expiring or overdue - click for details"
              >
                <AlertCircle size={10} strokeWidth={2} />
                {totalAlerts}
              </button>
            )}
            {pendingUpdate && (
              <div className="flex items-center gap-1 bg-[oklch(0.95_0.05_25)] text-[oklch(0.45_0.18_25)] text-[10px] font-semibold px-2 py-1 rounded-full" title="Odometer update needed">
                <AlertCircle size={10} strokeWidth={2} />
                Pending
              </div>
            )}
            
            {/* Reminder popup */}
            {showReminderPopup && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-2xl shadow-lg p-3 z-50 border border-secondary">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <Bell size={12} strokeWidth={2} /> Upcoming Reminders
                  </h4>
                  <button onClick={() => setShowReminderPopup(false)} className="text-muted-foreground hover:text-foreground">×</button>
                </div>
                <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                  {upcomingReminders > 0 ? (
                    reminders
                      .filter(r => isReminderUpcoming(r, 3) && !isReminderOverdue(r))
                      .slice(0, 3)
                      .map(r => (
                        <div key={r.id} className="text-xs text-muted-foreground py-1">
                          <p className="font-semibold text-foreground">{r.title}</p>
                          <p className="text-[10px]">{new Date(r.dueDate).toLocaleDateString('en-IN')}</p>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No upcoming reminders</p>
                  )}
                </div>
                {onNavigateToReminders && (
                  <button
                    onClick={() => {
                      setShowReminderPopup(false)
                      onNavigateToReminders()
                    }}
                    className="w-full text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 rounded-lg py-1.5 flex items-center justify-center gap-1 transition-colors"
                  >
                    View All <ChevronRight size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
            
            {/* Document popup */}
            {showDocumentPopup && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-2xl shadow-lg p-3 z-50 border border-secondary">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                    <FileText size={12} strokeWidth={2} /> Documents
                  </h4>
                  <button onClick={() => setShowDocumentPopup(false)} className="text-muted-foreground hover:text-foreground">×</button>
                </div>
                <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                  {expiringDocs.length > 0 ? (
                    expiringDocs.slice(0, 3).map(d => (
                      <div key={d.id} className="text-xs text-muted-foreground py-1">
                        <p className="font-semibold text-foreground">{d.type.toUpperCase()}</p>
                        <p className="text-[10px]">
                          {isDocumentExpired(d) ? 'Expired' : d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('en-IN') : 'No expiry'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No expiring documents</p>
                  )}
                </div>
                {onNavigateToDocuments && (
                  <button
                    onClick={() => {
                      setShowDocumentPopup(false)
                      onNavigateToDocuments()
                    }}
                    className="w-full text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 rounded-lg py-1.5 flex items-center justify-center gap-1 transition-colors"
                  >
                    View All <ChevronRight size={12} strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>
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
