'use client'

import { useState } from 'react'
import { X, Zap } from 'lucide-react'
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

export function AddVehicleForm({ onClose, editVehicle }: AddVehicleFormProps) {
  const { addVehicle, updateVehicle } = useApp()
  const isEdit = !!editVehicle

  const [name, setName] = useState(editVehicle?.name ?? '')
  const [brand, setBrand] = useState(editVehicle?.brand ?? '')
  const [model, setModel] = useState(editVehicle?.model ?? '')
  const [type, setType] = useState<VehicleType>(editVehicle?.type ?? 'car')
  const [fuelType, setFuelType] = useState<FuelType>(editVehicle?.fuelType ?? 'petrol')
  const [odometer, setOdometer] = useState(editVehicle?.currentOdometer?.toString() ?? '0')
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 backdrop-blur-[2px]">
      <div
        className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-8 flex flex-col gap-5"
        style={{ boxShadow: '0 -8px 40px oklch(0.22 0.01 260 / 0.14)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X size={16} strokeWidth={2} className="text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    'py-2 rounded-xl text-xs font-semibold border transition-all',
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
                    'py-2.5 rounded-xl text-xs font-semibold border transition-all',
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
              <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-[oklch(0.93_0.05_180)] text-[oklch(0.28_0.09_180)]">
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
              <label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                {label}
              </label>
              <input
                id={id}
                value={value}
                onChange={e => { set(e.target.value); setErrors(prev => ({ ...prev, [id]: '' })) }}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              {errors[id] && <p className="text-destructive text-xs mt-1 font-medium">{errors[id]}</p>}
            </div>
          ))}

          {/* Odometer */}
          <div>
            <label htmlFor="odometer" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Current Odometer (km)
            </label>
            <input
              id="odometer"
              type="number"
              value={odometer}
              onChange={e => { setOdometer(e.target.value); setErrors(prev => ({ ...prev, odometer: '' })) }}
              placeholder="e.g. 15000"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            {errors.odometer && <p className="text-destructive text-xs mt-1 font-medium">{errors.odometer}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-bold text-white text-sm mt-1 transition-all active:scale-95"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
          >
            {isEdit ? 'Save Changes' : 'Add Vehicle'}
          </button>
        </form>
      </div>
    </div>
  )
}
