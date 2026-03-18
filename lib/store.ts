// AutoTrackPro — Local Storage Data Layer

export type FuelType = 'petrol' | 'diesel' | 'petrol+cng' | 'electric'
export type VehicleType = 'car' | 'bike' | 'scooty' | 'others'

export interface Vehicle {
  id: string
  name: string
  brand: string
  model: string
  type: VehicleType
  fuelType: FuelType
  currentOdometer: number
  createdAt: string
  lastOdometerUpdate: string
}

export interface FuelLog {
  id: string
  vehicleId: string
  date: string
  pricePerLitre: number
  amount: number
  litres: number
  odometer?: number
  notes?: string
}

export interface ServiceLog {
  id: string
  vehicleId: string
  date: string
  expense: number
  serviceType: string
  odometer?: number
  notes?: string
}

export interface AppData {
  userName: string
  onboardingComplete: boolean
  defaultFuelPrice: number
  vehicles: Vehicle[]
  fuelLogs: FuelLog[]
  serviceLogs: ServiceLog[]
}

const STORAGE_KEY = 'autotrackpro_data'

function getDefaultData(): AppData {
  return {
    userName: '',
    onboardingComplete: false,
    defaultFuelPrice: 100,
    vehicles: [],
    fuelLogs: [],
    serviceLogs: [],
  }
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return getDefaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultData()
    return JSON.parse(raw) as AppData
  } catch {
    return getDefaultData()
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// Backup / Restore
const BACKUP_KEY = 'AUTOTRACKPRO_v1'

export function exportBackup(data: AppData): void {
  const payload = { key: BACKUP_KEY, data, exportedAt: new Date().toISOString() }
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `autotrackpro_backup_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importBackup(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const payload = JSON.parse(e.target?.result as string)
        if (payload.key !== BACKUP_KEY) throw new Error('Invalid backup file')
        resolve(payload.data as AppData)
      } catch {
        reject(new Error('Invalid backup file format'))
      }
    }
    reader.readAsText(file)
  })
}

// Odometer helpers
export function needsOdometerUpdate(vehicle: Vehicle): boolean {
  const last = new Date(vehicle.lastOdometerUpdate).getTime()
  const now = Date.now()
  return now - last > 24 * 60 * 60 * 1000
}
