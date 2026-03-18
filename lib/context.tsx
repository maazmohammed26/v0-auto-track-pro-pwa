'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AppData, Vehicle, FuelLog, ServiceLog, loadData, saveData, generateId, needsOdometerUpdate } from './store'

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
  updateSettings: (settings: Partial<Pick<AppData, 'userName' | 'defaultFuelPrice'>>) => void
  setData: (data: AppData) => void
  vehiclesNeedingOdometerUpdate: Vehicle[]
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
    persist({ ...data, fuelLogs: data.fuelLogs.map(l => l.id === id ? { ...l, ...updates } : l) })
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
    persist({ ...data, serviceLogs: data.serviceLogs.map(l => l.id === id ? { ...l, ...updates } : l) })
  }, [data, persist])

  const deleteServiceLog = useCallback((id: string) => {
    persist({ ...data, serviceLogs: data.serviceLogs.filter(l => l.id !== id) })
  }, [data, persist])

  const updateSettings = useCallback((settings: Partial<Pick<AppData, 'userName' | 'defaultFuelPrice'>>) => {
    persist({ ...data, ...settings })
  }, [data, persist])

  const setData = useCallback((newData: AppData) => {
    persist(newData)
  }, [persist])

  const vehiclesNeedingOdometerUpdate = data.vehicles.filter(needsOdometerUpdate)

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
      addServiceLog,
      updateServiceLog,
      deleteServiceLog,
      updateSettings,
      setData,
      vehiclesNeedingOdometerUpdate,
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
