'use client'

import { useState } from 'react'
import { ArrowLeft, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import type { VehicleType, FuelType } from '@/lib/store'
import { cn } from '@/lib/utils'

interface AddVehicleFormProps {
  onClose: () => void
  editVehicle?: {
    id: string
    name: string
    brand: string
    model: string
    type: VehicleType
    fuelType: FuelType
    currentOdometer: number
  }
}

const vehicleTypes: { value: VehicleType; label: string }[] = [
  { value: 'car', label: 'Car' },
  { value: 'bike', label: 'Bike' },
  { value: 'scooty', label: 'Scooty' },
  { value: 'others', label: 'Others' },
]

const fuelTypes: { value: FuelType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol+cng', label: 'Petrol + CNG' },
  { value: 'electric', label: 'Electric' },
]

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all'

export function AddVehicleForm({ onClose, editVehicle }: AddVehicleFormProps) {
  const { addVehicle, updateVehicle } = useApp()
  const isEdit = !!editVehicle

  const [name, setName] = useState(editVehicle?.name ?? '')
  const [brand, setBrand] = useState(editVehicle?.brand ?? '')
  const [model, setModel] = useState(editVehicle?.model ?? '')
  const [type, setType] = useState<VehicleType>(editVehicle?.type ?? 'car')
  const [fuelType, setFuelType] = useState<FuelType>(editVehicle?.fuelType ?? 'petrol')
  const [odometer, setOdometer] = useState(editVehicle?.currentOdometer?.toString() ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Vehicle name is required'
    if (!brand.trim()) e.brand = 'Brand is required'
    if (!model.trim()) e.model = 'Model is required'
    if (isNaN(Number(odometer)) || Number(odometer) < 0) e.odometer = 'Enter a valid odometer reading'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (isEdit && editVehicle) {
      updateVehicle(editVehicle.id, {
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        type,
        fuelType,
        currentOdometer: Number(odometer),
      })
      toast('Vehicle updated')
    } else {
      addVehicle({
        name: name.trim(),
        brand: brand.trim(),
        model: model.trim(),
        type,
        fuelType,
        currentOdometer: Number(odometer),
      })
      toast('Vehicle added')
    }
    onClose()
  }

  return (
    /* Full-screen page — no overlay, no fixed positioning, no BottomNav rendered */
    <div className="min-h-screen bg-background flex flex-col">

      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background flex items-center gap-3 px-5 pt-12 pb-4"
        style={{ borderBottom: '1px solid oklch(0.92 0.01 260)' }}>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-2xl bg-secondary flex items-center justify-center shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={2} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
        </h1>
      </header>

      {/* Scrollable form — grows to fill screen, natural scroll */}
      <main className="flex-1 overflow-y-auto">
        <form
          id="vehicle-form"
          onSubmit={handleSubmit}
          className="px-5 py-6 flex flex-col gap-5"
        >
          {/* Vehicle Type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Vehicle Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {vehicleTypes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={cn(
                    'py-2.5 rounded-xl text-xs font-semibold border transition-all',
                    type === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-foreground border-transparent'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
              Fuel Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fuelTypes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFuelType(value)}
                  className={cn(
                    'py-3 rounded-xl text-xs font-semibold border transition-all',
                    fuelType === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-foreground border-transparent'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {fuelType === 'electric' && (
              <div className="mt-2.5 flex items-start gap-2 p-3 rounded-xl bg-[oklch(0.93_0.05_180)] text-[oklch(0.28_0.09_180)]">
                <Zap size={14} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed font-medium">
                  This vehicle is electric. Fuel tracking is not applicable.
                </p>
              </div>
            )}
          </div>

          {/* Text fields */}
          {[
            { id: 'name', label: 'Vehicle Name', value: name, set: setName, placeholder: 'e.g. My Swift' },
            { id: 'brand', label: 'Brand', value: brand, set: setBrand, placeholder: 'e.g. Maruti' },
            { id: 'model', label: 'Model', value: model, set: setModel, placeholder: 'e.g. Swift VXI' },
          ].map(({ id, label, value, set, placeholder }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                {label}
              </label>
              <input
                id={id}
                value={value}
                onChange={e => { set(e.target.value); setErrors(prev => ({ ...prev, [id]: '' })) }}
                placeholder={placeholder}
                className={inputClass}
              />
              {errors[id] && <p className="text-destructive text-xs mt-1 font-medium">{errors[id]}</p>}
            </div>
          ))}

          {/* Odometer */}
          <div>
            <label
              htmlFor="odometer"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block"
            >
              Current Odometer (km)
            </label>
            <input
              id="odometer"
              type="number"
              inputMode="numeric"
              value={odometer}
              onChange={e => { setOdometer(e.target.value); setErrors(prev => ({ ...prev, odometer: '' })) }}
              placeholder="e.g. 15000"
              className={inputClass}
            />
            {errors.odometer && <p className="text-destructive text-xs mt-1 font-medium">{errors.odometer}</p>}
          </div>
        </form>
      </main>

      {/* Submit button — pinned to bottom of screen, always visible, never behind nav */}
      <footer className="shrink-0 px-5 py-4 bg-background"
        style={{ borderTop: '1px solid oklch(0.92 0.01 260)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <button
          type="submit"
          form="vehicle-form"
          className="w-full py-4 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98]"
          style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
        >
          {isEdit ? 'Save Changes' : 'Add Vehicle'}
        </button>
      </footer>
    </div>
  )
}
