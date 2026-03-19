'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import {
  AppData,
  Vehicle,
  FuelLog,
  ServiceLog,
  ChargingLog,
  Reminder,
  VehicleDocument,
  UserProfile,
  loadData,
  saveData,
  generateId,
  needsOdometerUpdate,
  isReminderOverdue,
  isReminderUpcoming,
} from './store'

interface AppContextValue {
  data: AppData
  completeOnboarding: (name: string) => void
  addVehicle: (v: Omit<Vehicle, 'id' | 'createdAt' | 'lastOdometerUpdate'>) => Vehicle
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void
  deleteVehicle: (id: string) => void
  updateOdometer: (vehicleId: string, odometer: number) => void
  addFuelLog: (log: Omit<FuelLog, 'id'>) => void
  updateFuelLog: (id: string, updates: Partial<FuelLog>) => void
  deleteFuelLog: (id: string) => void
  addServiceLog: (log: Omit<ServiceLog, 'id'>) => void
  updateServiceLog: (id: string, updates: Partial<ServiceLog>) => void
  deleteServiceLog: (id: string) => void
  addChargingLog: (log: Omit<ChargingLog, 'id'>) => void
  updateChargingLog: (id: string, updates: Partial<ChargingLog>) => void
  deleteChargingLog: (id: string) => void
  updateSettings: (settings: Partial<Pick<AppData, 'userName' | 'defaultFuelPrice'>>) => void
  updateUserProfile: (profile: Partial<UserProfile>) => void
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => Reminder
  updateReminder: (id: string, updates: Partial<Reminder>) => void
  deleteReminder: (id: string) => void
  completeReminder: (id: string) => void
  snoozeReminder: (id: string) => void
  addDocument: (d: Omit<VehicleDocument, 'id' | 'createdAt'>) => VehicleDocument
  updateDocument: (id: string, updates: Partial<VehicleDocument>) => void
  deleteDocument: (id: string) => void
  snoozeDocumentAlert: (id: string) => void
  dismissDocumentAlert: (id: string) => void
  toggleMileageTracking: () => void
  setData: (data: AppData) => void
  setPwaPromptShown: () => void
  vehiclesNeedingOdometerUpdate: Vehicle[]
  overdueReminders: Reminder[]
  upcomingReminders: Reminder[]
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AppData>(() => loadData())

  const persist = useCallback((newData: AppData) => {
    setDataState(newData)
    saveData(newData)
  }, [])

  const completeOnboarding = useCallback((name: string) => {
    persist({ ...data, userName: name, onboardingComplete: true })
  }, [data, persist])

  const addVehicle = useCallback((v: Omit<Vehicle, 'id' | 'createdAt' | 'lastOdometerUpdate'>) => {
    const now = new Date().toISOString()
    const vehicle: Vehicle = { ...v, id: generateId(), createdAt: now, lastOdometerUpdate: now }
    persist({ ...data, vehicles: [...data.vehicles, vehicle] })
    return vehicle
  }, [data, persist])

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    persist({
      ...data,
      vehicles: data.vehicles.map(v => v.id === id ? { ...v, ...updates } : v),
    })
  }, [data, persist])

  const deleteVehicle = useCallback((id: string) => {
    persist({
      ...data,
      vehicles: data.vehicles.filter(v => v.id !== id),
      fuelLogs: data.fuelLogs.filter(l => l.vehicleId !== id),
      serviceLogs: data.serviceLogs.filter(l => l.vehicleId !== id),
      chargingLogs: data.chargingLogs.filter(l => l.vehicleId !== id),
      reminders: data.reminders.filter(r => r.vehicleId !== id),
      documents: data.documents.filter(d => d.vehicleId !== id),
    })
  }, [data, persist])

  const updateOdometer = useCallback((vehicleId: string, odometer: number) => {
    persist({
      ...data,
      vehicles: data.vehicles.map(v =>
        v.id === vehicleId
          ? { ...v, currentOdometer: Math.max(v.currentOdometer, odometer), lastOdometerUpdate: new Date().toISOString() }
          : v
      ),
    })
  }, [data, persist])

  const addFuelLog = useCallback((log: Omit<FuelLog, 'id'>) => {
    const newLog: FuelLog = { ...log, id: generateId() }
    let updatedVehicles = data.vehicles
    if (log.odometer) {
      updatedVehicles = data.vehicles.map(v =>
        v.id === log.vehicleId && log.odometer! > v.currentOdometer
          ? { ...v, currentOdometer: log.odometer!, lastOdometerUpdate: new Date().toISOString() }
          : v
      )
    }
    persist({ ...data, fuelLogs: [...data.fuelLogs, newLog], vehicles: updatedVehicles })
  }, [data, persist])

  const updateFuelLog = useCallback((id: string, updates: Partial<FuelLog>) => {
    const updatedLogs = data.fuelLogs.map(l => l.id === id ? { ...l, ...updates } : l)
    const updatedLog = updatedLogs.find(l => l.id === id)
    let updatedVehicles = data.vehicles
    if (updatedLog?.odometer) {
      updatedVehicles = data.vehicles.map(v =>
        v.id === updatedLog.vehicleId && updatedLog.odometer! > v.currentOdometer
          ? { ...v, currentOdometer: updatedLog.odometer!, lastOdometerUpdate: new Date().toISOString() }
          : v
      )
    }
    persist({ ...data, fuelLogs: updatedLogs, vehicles: updatedVehicles })
  }, [data, persist])

  const deleteFuelLog = useCallback((id: string) => {
    persist({ ...data, fuelLogs: data.fuelLogs.filter(l => l.id !== id) })
  }, [data, persist])

  const addServiceLog = useCallback((log: Omit<ServiceLog, 'id'>) => {
    const newLog: ServiceLog = { ...log, id: generateId() }
    let updatedVehicles = data.vehicles
    if (log.odometer) {
      updatedVehicles = data.vehicles.map(v =>
        v.id === log.vehicleId && log.odometer! > v.currentOdometer
          ? { ...v, currentOdometer: log.odometer!, lastOdometerUpdate: new Date().toISOString() }
          : v
      )
    }
    persist({ ...data, serviceLogs: [...data.serviceLogs, newLog], vehicles: updatedVehicles })
  }, [data, persist])

  const updateServiceLog = useCallback((id: string, updates: Partial<ServiceLog>) => {
    const updatedLogs = data.serviceLogs.map(l => l.id === id ? { ...l, ...updates } : l)
    const updatedLog = updatedLogs.find(l => l.id === id)
    let updatedVehicles = data.vehicles
    if (updatedLog?.odometer) {
      updatedVehicles = data.vehicles.map(v =>
        v.id === updatedLog.vehicleId && updatedLog.odometer! > v.currentOdometer
          ? { ...v, currentOdometer: updatedLog.odometer!, lastOdometerUpdate: new Date().toISOString() }
          : v
      )
    }
    persist({ ...data, serviceLogs: updatedLogs, vehicles: updatedVehicles })
  }, [data, persist])

  const deleteServiceLog = useCallback((id: string) => {
    persist({ ...data, serviceLogs: data.serviceLogs.filter(l => l.id !== id) })
  }, [data, persist])

  const addChargingLog = useCallback((log: Omit<ChargingLog, 'id'>) => {
    const newLog: ChargingLog = { ...log, id: generateId() }
    let updatedVehicles = data.vehicles
    if (log.odometer) {
      updatedVehicles = data.vehicles.map(v =>
        v.id === log.vehicleId && log.odometer! > v.currentOdometer
          ? { ...v, currentOdometer: log.odometer!, lastOdometerUpdate: new Date().toISOString() }
          : v
      )
    }
    persist({ ...data, chargingLogs: [...data.chargingLogs, newLog], vehicles: updatedVehicles })
  }, [data, persist])

  const updateChargingLog = useCallback((id: string, updates: Partial<ChargingLog>) => {
    const updatedLogs = data.chargingLogs.map(l => l.id === id ? { ...l, ...updates } : l)
    const updatedLog = updatedLogs.find(l => l.id === id)
    let updatedVehicles = data.vehicles
    if (updatedLog?.odometer) {
      updatedVehicles = data.vehicles.map(v =>
        v.id === updatedLog.vehicleId && updatedLog.odometer! > v.currentOdometer
          ? { ...v, currentOdometer: updatedLog.odometer!, lastOdometerUpdate: new Date().toISOString() }
          : v
      )
    }
    persist({ ...data, chargingLogs: updatedLogs, vehicles: updatedVehicles })
  }, [data, persist])

  const deleteChargingLog = useCallback((id: string) => {
    persist({ ...data, chargingLogs: data.chargingLogs.filter(l => l.id !== id) })
  }, [data, persist])

  const updateSettings = useCallback((settings: Partial<Pick<AppData, 'userName' | 'defaultFuelPrice'>>) => {
    persist({ ...data, ...settings })
  }, [data, persist])

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    persist({ ...data, userProfile: { ...data.userProfile, ...profile } })
  }, [data, persist])

  // Reminders
  const addReminder = useCallback((r: Omit<Reminder, 'id' | 'createdAt' | 'isCompleted'>) => {
    const reminder: Reminder = { ...r, id: generateId(), createdAt: new Date().toISOString(), isCompleted: false }
    persist({ ...data, reminders: [...data.reminders, reminder] })
    return reminder
  }, [data, persist])

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    persist({ ...data, reminders: data.reminders.map(r => r.id === id ? { ...r, ...updates } : r) })
  }, [data, persist])

  const deleteReminder = useCallback((id: string) => {
    persist({ ...data, reminders: data.reminders.filter(r => r.id !== id) })
  }, [data, persist])

  const completeReminder = useCallback((id: string) => {
    persist({ ...data, reminders: data.reminders.map(r => r.id === id ? { ...r, isCompleted: true } : r) })
  }, [data, persist])

  const snoozeReminder = useCallback((id: string) => {
    persist({ ...data, reminders: data.reminders.map(r => r.id === id ? { ...r, lastSnoozedAt: new Date().toISOString() } : r) })
  }, [data, persist])

  // Documents
  const addDocument = useCallback((d: Omit<VehicleDocument, 'id' | 'createdAt'>) => {
    const doc: VehicleDocument = { ...d, id: generateId(), createdAt: new Date().toISOString() }
    persist({ ...data, documents: [...data.documents, doc] })
    return doc
  }, [data, persist])

  const updateDocument = useCallback((id: string, updates: Partial<VehicleDocument>) => {
    persist({ ...data, documents: data.documents.map(d => d.id === id ? { ...d, ...updates } : d) })
  }, [data, persist])

  const deleteDocument = useCallback((id: string) => {
    persist({ ...data, documents: data.documents.filter(d => d.id !== id) })
  }, [data, persist])

  const snoozeDocumentAlert = useCallback((id: string) => {
    persist({ ...data, documents: data.documents.map(d => d.id === id ? { ...d, lastAlertTime: new Date().toISOString() } : d) })
  }, [data, persist])

  const dismissDocumentAlert = useCallback((id: string) => {
    persist({ ...data, documents: data.documents.map(d => d.id === id ? { ...d, alertDismissed: true } : d) })
  }, [data, persist])

  const toggleMileageTracking = useCallback(() => {
    persist({ ...data, mileageTrackingEnabled: !data.mileageTrackingEnabled })
  }, [data, persist])

  const setData = useCallback((newData: AppData) => {
    persist(newData)
  }, [persist])

  const setPwaPromptShown = useCallback(() => {
    persist({ ...data, pwaPromptShown: true })
  }, [data, persist])

  const vehiclesNeedingOdometerUpdate = data.vehicles.filter(needsOdometerUpdate)
  const overdueReminders = data.reminders.filter(isReminderOverdue)
  const upcomingReminders = data.reminders.filter(r => isReminderUpcoming(r, 3))

  return (
    <AppContext.Provider value={{
      data,
      completeOnboarding,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      updateOdometer,
      addFuelLog,
      updateFuelLog,
      deleteFuelLog,
      addChargingLog,
      updateChargingLog,
      deleteChargingLog,
      addServiceLog,
      updateServiceLog,
      deleteServiceLog,
      updateSettings,
      updateUserProfile,
      addReminder,
      updateReminder,
      deleteReminder,
      completeReminder,
      snoozeReminder,
      addDocument,
      updateDocument,
      deleteDocument,
      snoozeDocumentAlert,
      dismissDocumentAlert,
      toggleMileageTracking,
      setData,
      setPwaPromptShown,
      vehiclesNeedingOdometerUpdate,
      overdueReminders,
      upcomingReminders,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
