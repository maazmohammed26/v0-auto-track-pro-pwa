'use client'

import { useState } from 'react'
import { X, Bell, Calendar, Gauge } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import type { Reminder, ReminderType } from '@/lib/store'

interface ReminderFormProps {
  vehicleId: string
  onClose: () => void
  editReminder?: Reminder
}

const reminderTypes: { value: ReminderType; label: string }[] = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'puc', label: 'PUC Renewal' },
  { value: 'insurance', label: 'Insurance Renewal' },
  { value: 'service', label: 'General Service' },
  { value: 'custom', label: 'Custom' },
]

export function ReminderForm({ vehicleId, onClose, editReminder }: ReminderFormProps) {
  const { addReminder, updateReminder, data } = useApp()
  const isEdit = !!editReminder
  const vehicle = data.vehicles.find(v => v.id === vehicleId)

  const [type, setType] = useState<ReminderType>(editReminder?.type ?? 'service')
  const [title, setTitle] = useState(editReminder?.title ?? '')
  const [dueDate, setDueDate] = useState(editReminder?.dueDate ?? '')
  const [dueMileage, setDueMileage] = useState(editReminder?.dueMileage?.toString() ?? '')
  const [isMileageBased, setIsMileageBased] = useState(editReminder?.isMileageBased ?? false)
  const [notes, setNotes] = useState(editReminder?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function getDefaultTitle(t: ReminderType): string {
    switch (t) {
      case 'oil_change': return 'Oil Change Due'
      case 'puc': return 'PUC Renewal Due'
      case 'insurance': return 'Insurance Renewal Due'
      case 'service': return 'Service Due'
      default: return ''
    }
  }

  function handleTypeChange(newType: ReminderType) {
    setType(newType)
    if (!title || reminderTypes.some(r => r.value !== 'custom' && getDefaultTitle(r.value) === title)) {
      setTitle(getDefaultTitle(newType))
    }
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required'
    if (isMileageBased) {
      if (!dueMileage) errs.dueMileage = 'Due mileage is required for km-based reminders'
    } else {
      if (!dueDate) errs.dueDate = 'Due date is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const reminderData = {
      vehicleId,
      type,
      title: title.trim(),
      dueDate: isMileageBased ? '' : dueDate,
      dueMileage: dueMileage ? Number(dueMileage) : undefined,
      notes: notes.trim() || undefined,
      isMileageBased,
    }

    if (isEdit && editReminder) {
      updateReminder(editReminder.id, reminderData)
      toast('Reminder updated')
    } else {
      addReminder(reminderData)
      toast('Reminder added')
    }
    onClose()
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-[2px] p-0">
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl max-h-[90vh] overflow-y-auto hide-scrollbar animate-in slide-in-from-bottom-4 duration-300"
        style={{ boxShadow: 'var(--shadow-clay-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Reminder' : 'Add Reminder'}</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center" aria-label="Close">
            <X size={18} strokeWidth={1.75} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Reminder Type Chips */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bell size={12} strokeWidth={2} /> Reminder Type
            </label>
            <div className="flex flex-wrap gap-2">
              {reminderTypes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeChange(value)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    type === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Oil change due"
              className={`${inputClass} ${errors.title ? 'ring-2 ring-destructive/50' : ''}`}
            />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Reminder Mode Toggle */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Reminder Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsMileageBased(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  !isMileageBased ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Calendar size={13} strokeWidth={1.75} className="inline mr-1" /> Date-Based
              </button>
              <button
                type="button"
                onClick={() => setIsMileageBased(true)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isMileageBased ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Gauge size={13} strokeWidth={1.75} className="inline mr-1" /> KM-Based
              </button>
            </div>
          </div>

          {/* Due Date (conditional) */}
          {!isMileageBased && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} strokeWidth={2} /> Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={`${inputClass} ${errors.dueDate ? 'ring-2 ring-destructive/50' : ''}`}
              />
              {errors.dueDate && <p className="text-destructive text-xs mt-1">{errors.dueDate}</p>}
            </div>
          )}

          {/* Due Mileage (conditional) */}
          {isMileageBased && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Gauge size={12} strokeWidth={2} /> Due at Mileage (km) *
              </label>
              <input
                type="number"
                value={dueMileage}
                onChange={e => setDueMileage(e.target.value)}
                placeholder={vehicle ? `Current: ${vehicle.currentOdometer.toLocaleString('en-IN')} km` : 'e.g. 50000'}
                className={`${inputClass} ${errors.dueMileage ? 'ring-2 ring-destructive/50' : ''}`}
              />
              {errors.dueMileage && <p className="text-destructive text-xs mt-1">{errors.dueMileage}</p>}
              {isMileageBased && vehicle && dueMileage && (
                <p className="text-xs text-muted-foreground mt-2">Alert will trigger {Math.max(0, Number(dueMileage) - vehicle.currentOdometer).toLocaleString('en-IN')} km before due</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Notes <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.35)' }}
          >
            {isEdit ? 'Update Reminder' : 'Add Reminder'}
          </button>
        </form>
      </div>
    </div>
  )
}
