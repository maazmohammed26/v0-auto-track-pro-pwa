// AutoTrackPro — Local Storage Data Layer

export type FuelType = 'petrol' | 'diesel' | 'petrol+cng' | 'electric'
export type VehicleType = 'car' | 'bike' | 'scooty' | 'others'
export type ReminderType = 'oil_change' | 'puc' | 'insurance' | 'service' | 'custom'
export type DocumentType = 'puc' | 'insurance' | 'rc' | 'other'

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

export interface ChargingLog {
  id: string
  vehicleId: string
  date: string
  amountSpent: number
  chargingType?: 'home' | 'public'
  odometer?: number
  notes?: string
}

export interface UserProfile {
  dateOfBirth?: string
  licenseNumber?: string
  licenseExpiry?: string
  address?: string
}

export interface Reminder {
  id: string
  vehicleId: string
  type: ReminderType
  title: string
  dueDate: string
  dueMileage?: number
  notes?: string
  isCompleted: boolean
  createdAt: string
  lastSnoozedAt?: string
  isMileageBased?: boolean
}

export interface VehicleDocument {
  id: string
  vehicleId: string
  type: DocumentType
  title: string
  expiryDate?: string
  link?: string
  notes?: string
  createdAt: string
  lastAlertTime?: string
  alertDismissed?: boolean
}

export interface AppData {
  userName: string
  onboardingComplete: boolean
  defaultFuelPrice: number
  mileageTrackingEnabled: boolean
  userProfile: UserProfile
  vehicles: Vehicle[]
  fuelLogs: FuelLog[]
  serviceLogs: ServiceLog[]
  chargingLogs: ChargingLog[]
  reminders: Reminder[]
  documents: VehicleDocument[]
  pwaPromptShown?: boolean
}

const STORAGE_KEY = 'autotrackpro_data'

function getDefaultData(): AppData {
  return {
    userName: '',
    onboardingComplete: false,
    defaultFuelPrice: 100,
    mileageTrackingEnabled: true,
    userProfile: {},
    vehicles: [],
    fuelLogs: [],
    serviceLogs: [],
    chargingLogs: [],
    reminders: [],
    documents: [],
    pwaPromptShown: false,
  }
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return getDefaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    // Merge with defaults for any missing fields (migration)
    return {
      ...getDefaultData(),
      ...parsed,
      userProfile: { ...getDefaultData().userProfile, ...parsed.userProfile },
    }
  } catch {
    return getDefaultData()
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  // Also save to IndexedDB for better offline support (async, non-blocking)
  import('./idb').then(({ saveToIDB }) => {
    saveToIDB(data).catch(() => { /* silently fail, localStorage is primary */ })
  }).catch(() => { /* module load failed, continue with localStorage only */ })
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
        // Merge with defaults for migration
        const restored = {
          ...getDefaultData(),
          ...payload.data,
          userProfile: { ...getDefaultData().userProfile, ...payload.data?.userProfile },
        }
        resolve(restored as AppData)
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

// Reminder helpers
export function isReminderOverdue(reminder: Reminder): boolean {
  if (reminder.isCompleted) return false
  const due = new Date(reminder.dueDate).getTime()
  return Date.now() > due
}

export function getReminderDaysUntil(reminder: Reminder): number {
  const due = new Date(reminder.dueDate).getTime()
  const now = Date.now()
  return Math.ceil((due - now) / (24 * 60 * 60 * 1000))
}

export function isReminderUpcoming(reminder: Reminder, days: number = 3): boolean {
  if (reminder.isCompleted) return false
  if (isReminderOverdue(reminder)) return false
  const daysUntil = getReminderDaysUntil(reminder)
  return daysUntil <= days && daysUntil >= 0
}

// Document helpers
export function isDocumentExpiringSoon(doc: VehicleDocument, daysThreshold = 30): boolean {
  if (!doc.expiryDate) return false
  const expiry = new Date(doc.expiryDate).getTime()
  const now = Date.now()
  const daysUntil = (expiry - now) / (24 * 60 * 60 * 1000)
  return daysUntil <= daysThreshold && daysUntil > 0
}

export function isDocumentExpired(doc: VehicleDocument): boolean {
  if (!doc.expiryDate) return false
  const expiry = new Date(doc.expiryDate).getTime()
  return Date.now() > expiry
}

export function getDocumentsExpiringInDays(docs: VehicleDocument[], days: number = 5): VehicleDocument[] {
  return docs.filter(doc => {
    if (!doc.expiryDate) return false
    const expiry = new Date(doc.expiryDate).getTime()
    const now = Date.now()
    const daysUntil = (expiry - now) / (24 * 60 * 60 * 1000)
    return daysUntil <= days && daysUntil > 0 && !isDocumentExpired(doc)
  })
}

export function shouldShowDocumentAlert(doc: VehicleDocument): boolean {
  if (doc.alertDismissed) return false
  if (!doc.expiryDate) return false
  if (isDocumentExpired(doc)) return true
  
  // If last alert was less than 12 hours ago, don't show again
  if (doc.lastAlertTime) {
    const lastAlert = new Date(doc.lastAlertTime).getTime()
    const now = Date.now()
    if (now - lastAlert < 12 * 60 * 60 * 1000) return false
  }
  
  // Show if expiring within 5 days
  return getDocumentsExpiringInDays([doc], 5).length > 0
}

// Mileage helpers
export function calculateKmPerLiter(vehicle: Vehicle, fuelLogs: FuelLog[]): number | null {
  const logs = fuelLogs.filter(l => l.vehicleId === vehicle.id && l.odometer).sort((a, b) => (a.odometer ?? 0) - (b.odometer ?? 0))
  if (logs.length < 2) return null
  
  const totalKm = (logs[logs.length - 1].odometer ?? 0) - (logs[0].odometer ?? 0)
  const totalLitres = logs.slice(1).reduce((sum, l) => sum + l.litres, 0)
  
  if (totalLitres <= 0 || totalKm <= 0) return null
  return totalKm / totalLitres
}

export function calculateKmPerCharge(vehicle: Vehicle, chargingLogs: ChargingLog[]): number | null {
  const logs = chargingLogs.filter(l => l.vehicleId === vehicle.id && l.odometer).sort((a, b) => (a.odometer ?? 0) - (b.odometer ?? 0))
  if (logs.length < 2) return null
  
  const totalKm = (logs[logs.length - 1].odometer ?? 0) - (logs[0].odometer ?? 0)
  const totalCharges = logs.slice(1).length
  
  if (totalCharges <= 0 || totalKm <= 0) return null
  return totalKm / totalCharges
}

export function getTotalDistanceDriven(vehicles: Vehicle[], fuelLogs: FuelLog[], chargingLogs: ChargingLog[]): number {
  let totalDistance = 0
  
  for (const vehicle of vehicles) {
    const allLogs = [
      ...fuelLogs.filter(l => l.vehicleId === vehicle.id && l.odometer),
      ...chargingLogs.filter(l => l.vehicleId === vehicle.id && l.odometer)
    ].sort((a, b) => {
      const aOdo = 'odometer' in a ? a.odometer ?? 0 : 0
      const bOdo = 'odometer' in b ? b.odometer ?? 0 : 0
      return aOdo - bOdo
    })
    
    if (allLogs.length > 0) {
      const firstOdo = ('odometer' in allLogs[0] ? allLogs[0].odometer : 0) ?? 0
      const lastOdo = ('odometer' in allLogs[allLogs.length - 1] ? allLogs[allLogs.length - 1].odometer : 0) ?? 0
      totalDistance += Math.max(0, lastOdo - firstOdo)
    }
  }
  
  return Math.round(totalDistance)
}

// Smart reminder helpers
export function isSmartReminderDue(reminder: Reminder, currentOdometer: number): boolean {
  if (reminder.isCompleted || !reminder.isMileageBased) return false
  if (!reminder.dueMileage) return false
  
  // Check if snooze has expired (12 hours)
  if (reminder.lastSnoozedAt) {
    const lastSnooze = new Date(reminder.lastSnoozedAt).getTime()
    const now = Date.now()
    if (now - lastSnooze < 12 * 60 * 60 * 1000) return false
  }
  
  return currentOdometer >= reminder.dueMileage - 200 && currentOdometer < reminder.dueMileage
}

export function getReminderKmRemaining(reminder: Reminder, currentOdometer: number): number {
  if (!reminder.dueMileage) return -1
  return Math.max(0, reminder.dueMileage - currentOdometer)
}
