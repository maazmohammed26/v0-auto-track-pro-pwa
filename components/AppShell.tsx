'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/lib/context'
import { shouldShowReminderDueAlert } from '@/lib/store'
import { Onboarding } from './Onboarding'
import { BottomNav } from './BottomNav'
import { HomePage } from './HomePage'
import { InsightsPage } from './InsightsPage'
import { ProductsPage } from './ProductsPage'
import { SettingsPage } from './SettingsPage'
import { VehicleDetail } from './VehicleDetail'
import { OdometerReminder } from './OdometerReminder'
import { ReminderDueAlert } from './ReminderDueAlert'
import { LoadingScreen } from './LoadingScreen'
import { PwaInstallPrompt } from './PwaInstallPrompt'
import { AddVehicleForm } from './AddVehicleForm'

type Tab = 'home' | 'insights' | 'products' | 'settings'

export function AppShell() {
  const { data, vehiclesNeedingOdometerUpdate, setPwaPromptShown, completeReminder, snoozeReminder } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [selectedVehicleTab, setSelectedVehicleTab] = useState<string | null>(null)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const [reminderDismissed, setReminderDismissed] = useState(false)
  const [showPwaPrompt, setShowPwaPrompt] = useState(false)
  const [showReminderDueAlert, setShowReminderDueAlert] = useState(false)
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null)
  
  // Find reminders due today that should show alert
  const reminderDueToday = useMemo(() => {
    return data.reminders.find(r => shouldShowReminderDueAlert(r))
  }, [data.reminders])

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

  // Show reminder due today alert
  useEffect(() => {
    if (splashDone && data.onboardingComplete && reminderDueToday && !showReminderDueAlert) {
      const t = setTimeout(() => setShowReminderDueAlert(true), 500)
      return () => clearTimeout(t)
    }
  }, [splashDone, data.onboardingComplete, reminderDueToday, showReminderDueAlert])

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

  // Add vehicle full-page view
  if (showAddVehicle) {
    return <AddVehicleForm onClose={() => setShowAddVehicle(false)} />
  }

  // Vehicle detail view
  if (selectedVehicleId) {
    return (
      <>
        <VehicleDetail
          vehicleId={selectedVehicleId}
          initialTab={selectedVehicleTab}
          onBack={() => { setSelectedVehicleId(null); setSelectedVehicleTab(null) }}
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
          onSelectVehicle={(id, tab) => { setSelectedVehicleId(id); setSelectedVehicleTab(tab || null) }}
          onGoToSettings={() => setActiveTab('settings')}
          onAddVehicle={() => setShowAddVehicle(true)}
        />
      </div>
      <div style={{ display: activeTab === 'insights' ? 'block' : 'none' }}>
        <InsightsPage />
      </div>
      <div style={{ display: activeTab === 'products' ? 'block' : 'none' }}>
        <ProductsPage />
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

      {/* Reminder due today alert */}
      {showReminderDueAlert && reminderDueToday && (
        <ReminderDueAlert
          reminder={reminderDueToday}
          onMarkDone={() => {
            completeReminder(reminderDueToday.id)
            setShowReminderDueAlert(false)
          }}
          onEdit={() => {
            setEditingReminderId(reminderDueToday.id)
            setShowReminderDueAlert(false)
          }}
          onSnooze={() => {
            snoozeReminder(reminderDueToday.id)
            setShowReminderDueAlert(false)
          }}
        />
      )}
    </div>
  )
}
