'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { Onboarding } from './Onboarding'
import { BottomNav } from './BottomNav'
import { HomePage } from './HomePage'
import { InsightsPage } from './InsightsPage'
import { SettingsPage } from './SettingsPage'
import { VehicleDetail } from './VehicleDetail'
import { OdometerReminder } from './OdometerReminder'
import { Gauge } from 'lucide-react'

type Tab = 'home' | 'insights' | 'settings'

export function AppShell() {
  const { data, vehiclesNeedingOdometerUpdate } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [showReminder, setShowReminder] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const [reminderDismissed, setReminderDismissed] = useState(false)

  // Splash animation
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1200)
    return () => clearTimeout(t)
  }, [])

  // Show odometer reminder after splash, once per session
  useEffect(() => {
    if (splashDone && data.onboardingComplete && vehiclesNeedingOdometerUpdate.length > 0 && !reminderDismissed) {
      const t = setTimeout(() => setShowReminder(true), 400)
      return () => clearTimeout(t)
    }
  }, [splashDone, data.onboardingComplete, vehiclesNeedingOdometerUpdate.length, reminderDismissed])

  // Splash screen
  if (!splashDone) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 8px 32px oklch(0.55 0.18 250 / 0.4)' }}
        >
          <Gauge size={40} strokeWidth={1.5} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">AutoTrackPro</h1>
          <p className="text-muted-foreground text-sm mt-1">Loading your vehicles...</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // Onboarding
  if (!data.onboardingComplete) {
    return <Onboarding />
  }

  // Vehicle detail view
  if (selectedVehicleId) {
    return (
      <>
        <VehicleDetail
          vehicleId={selectedVehicleId}
          onBack={() => setSelectedVehicleId(null)}
        />
        {showReminder && (
          <OdometerReminder
            vehicles={vehiclesNeedingOdometerUpdate}
            onDismiss={() => { setShowReminder(false); setReminderDismissed(true) }}
          />
        )}
      </>
    )
  }

  return (
    <div className="relative">
      {/* Pages */}
      <div style={{ display: activeTab === 'home' ? 'block' : 'none' }}>
        <HomePage onSelectVehicle={(id) => { setSelectedVehicleId(id) }} />
      </div>
      <div style={{ display: activeTab === 'insights' ? 'block' : 'none' }}>
        <InsightsPage />
      </div>
      <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
        <SettingsPage />
      </div>

      {/* Bottom Nav */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Odometer reminder */}
      {showReminder && (
        <OdometerReminder
          vehicles={vehiclesNeedingOdometerUpdate}
          onDismiss={() => { setShowReminder(false); setReminderDismissed(true) }}
        />
      )}
    </div>
  )
}
