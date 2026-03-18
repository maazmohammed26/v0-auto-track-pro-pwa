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
import { LoadingScreen } from './LoadingScreen'
import { PwaInstallPrompt } from './PwaInstallPrompt'

type Tab = 'home' | 'insights' | 'settings'

export function AppShell() {
  const { data, vehiclesNeedingOdometerUpdate, setPwaPromptShown } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [showReminder, setShowReminder] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const [reminderDismissed, setReminderDismissed] = useState(false)
  const [showPwaPrompt, setShowPwaPrompt] = useState(false)

  // Splash animation
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Show odometer reminder after splash, once per session
  useEffect(() => {
    if (splashDone && data.onboardingComplete && vehiclesNeedingOdometerUpdate.length > 0 && !reminderDismissed) {
      const t = setTimeout(() => setShowReminder(true), 400)
      return () => clearTimeout(t)
    }
  }, [splashDone, data.onboardingComplete, vehiclesNeedingOdometerUpdate.length, reminderDismissed])

  // Show PWA prompt for first-time users after onboarding completes
  useEffect(() => {
    if (splashDone && data.onboardingComplete && !data.pwaPromptShown) {
      // Check if not already installed as PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (!isStandalone) {
        const t = setTimeout(() => setShowPwaPrompt(true), 800)
        return () => clearTimeout(t)
      }
    }
  }, [splashDone, data.onboardingComplete, data.pwaPromptShown])

  function handlePwaPromptDismiss() {
    setShowPwaPrompt(false)
    setPwaPromptShown()
  }

  // Loading screen
  if (!splashDone) {
    return <LoadingScreen />
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
        <HomePage
          onSelectVehicle={(id) => { setSelectedVehicleId(id) }}
          onGoToSettings={() => setActiveTab('settings')}
        />
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

      {/* PWA install prompt */}
      {showPwaPrompt && <PwaInstallPrompt onDismiss={handlePwaPromptDismiss} />}
    </div>
  )
}
