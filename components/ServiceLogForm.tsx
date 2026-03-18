'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import type { ServiceLog } from '@/lib/store'

const SERVICE_TYPES = [
  'Oil Change',
  'Tyre Change',
  'Brake Service',
  'Air Filter',
  'Battery Replacement',
  'Insurance',
  'General Service',
  'Other',
]

interface ServiceLogFormProps {
  vehicleId: string
  onClose: () => void
  editLog?: ServiceLog
}

export function ServiceLogForm({ vehicleId, onClose, editLog }: ServiceLogFormProps) {
  const { addServiceLog, updateServiceLog } = useApp()
  const isEdit = !!editLog

  const [date, setDate] = useState(editLog?.date ?? new Date().toISOString().split('T')[0])
  const [expense, setExpense] = useState(editLog?.expense?.toString() ?? '')
  const [serviceType, setServiceType] = useState(editLog?.serviceType ?? '')
  const [odometer, setOdometer] = useState(editLog?.odometer?.toString() ?? '')
  const [notes, setNotes] = useState(editLog?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!expense || isNaN(Number(expense)) || Number(expense) < 0) e.expense = 'Enter a valid expense amount'
    if (!serviceType.trim()) e.serviceType = 'Service type is required'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const log = {
      vehicleId,
      date,
      expense: Number(expense),
      serviceType: serviceType.trim(),
      odometer: odometer ? Number(odometer) : undefined,
      notes: notes.trim() || undefined,
    }

    if (isEdit && editLog) {
      updateServiceLog(editLog.id, log)
      toast('Service log updated')
    } else {
      addServiceLog(log)
      toast('Service log added')
    }
    onClose()
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-[2px]">
      <div
        className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-8 max-h-[90vh] overflow-y-auto hide-scrollbar"
        style={{ boxShadow: '0 -8px 40px oklch(0.22 0.01 260 / 0.14)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Service Log' : 'Add Service Log'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X size={16} strokeWidth={2} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Expense (₹)
            </label>
            <input
              type="number"
              value={expense}
              onChange={e => { setExpense(e.target.value); setErrors(p => ({ ...p, expense: '' })) }}
              placeholder="e.g. 1500"
              className={inputClass}
            />
            {errors.expense && <p className="text-destructive text-xs mt-1 font-medium">{errors.expense}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Service Type
            </label>
            {/* Quick select chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              {SERVICE_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setServiceType(t); setErrors(p => ({ ...p, serviceType: '' })) }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    serviceType === t
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-foreground border-transparent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              value={serviceType}
              onChange={e => { setServiceType(e.target.value); setErrors(p => ({ ...p, serviceType: '' })) }}
              placeholder="Or type a custom service..."
              className={inputClass}
            />
            {errors.serviceType && <p className="text-destructive text-xs mt-1 font-medium">{errors.serviceType}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Odometer at Service (km) <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </label>
            <input
              type="number"
              value={odometer}
              onChange={e => setOdometer(e.target.value)}
              placeholder="e.g. 15200"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Notes <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-white text-sm mt-1 transition-all active:scale-95"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
          >
            {isEdit ? 'Save Changes' : 'Add Service'}
          </button>
        </form>
      </div>
    </div>
  )
}
