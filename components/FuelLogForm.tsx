'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import type { FuelLog } from '@/lib/store'

interface FuelLogFormProps {
  vehicleId: string
  onClose: () => void
  editLog?: FuelLog
}

export function FuelLogForm({ vehicleId, onClose, editLog }: FuelLogFormProps) {
  const { addFuelLog, updateFuelLog, data } = useApp()
  const isEdit = !!editLog
  const defaultPrice = data.defaultFuelPrice

  const [date, setDate] = useState(editLog?.date ?? new Date().toISOString().slice(0, 16))
  const [pricePerLitre, setPricePerLitre] = useState(editLog?.pricePerLitre?.toString() ?? defaultPrice.toString())
  const [amount, setAmount] = useState(editLog?.amount?.toString() ?? '')
  const [litres, setLitres] = useState(editLog?.litres?.toString() ?? '')
  const [odometer, setOdometer] = useState(editLog?.odometer?.toString() ?? '')
  const [notes, setNotes] = useState(editLog?.notes ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-calculate litres when amount changes
  function handleAmountChange(val: string) {
    setAmount(val)
    const a = parseFloat(val)
    const p = parseFloat(pricePerLitre)
    if (!isNaN(a) && !isNaN(p) && p > 0) {
      setLitres((a / p).toFixed(2))
    }
  }

  // Auto-calculate amount when litres changes
  function handleLitresChange(val: string) {
    setLitres(val)
    const l = parseFloat(val)
    const p = parseFloat(pricePerLitre)
    if (!isNaN(l) && !isNaN(p) && p > 0) {
      setAmount((l * p).toFixed(2))
    }
  }

  function handlePriceChange(val: string) {
    setPricePerLitre(val)
    const p = parseFloat(val)
    const a = parseFloat(amount)
    if (!isNaN(p) && !isNaN(a) && p > 0) {
      setLitres((a / p).toFixed(2))
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = 'Enter a valid amount'
    if (!litres || isNaN(Number(litres)) || Number(litres) <= 0) e.litres = 'Enter valid litres'
    if (!pricePerLitre || isNaN(Number(pricePerLitre)) || Number(pricePerLitre) <= 0) e.pricePerLitre = 'Enter valid price'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    const log = {
      vehicleId,
      date,
      pricePerLitre: Number(pricePerLitre),
      amount: Number(amount),
      litres: Number(litres),
      odometer: odometer ? Number(odometer) : undefined,
      notes: notes.trim() || undefined,
    }

    if (isEdit && editLog) {
      updateFuelLog(editLog.id, log)
      toast('Fuel log updated')
    } else {
      addFuelLog(log)
      toast('Fuel log added')
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
          <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Fuel Log' : 'Add Fuel Log'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X size={16} strokeWidth={2} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Date & Time</label>
            <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Price per Litre (₹)
            </label>
            <input
              type="number"
              value={pricePerLitre}
              onChange={e => handlePriceChange(e.target.value)}
              placeholder="e.g. 105"
              className={inputClass}
            />
            {errors.pricePerLitre && <p className="text-destructive text-xs mt-1 font-medium">{errors.pricePerLitre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Amount Paid (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="e.g. 500"
                className={inputClass}
              />
              {errors.amount && <p className="text-destructive text-xs mt-1 font-medium">{errors.amount}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Litres
              </label>
              <input
                type="number"
                value={litres}
                onChange={e => handleLitresChange(e.target.value)}
                placeholder="e.g. 4.76"
                className={inputClass}
              />
              {errors.litres && <p className="text-destructive text-xs mt-1 font-medium">{errors.litres}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Odometer (km) <span className="text-muted-foreground font-normal normal-case">(optional)</span>
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
            {isEdit ? 'Save Changes' : 'Add Entry'}
          </button>
        </form>
      </div>
    </div>
  )
}
