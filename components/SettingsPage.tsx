'use client'

import { useState, useRef } from 'react'
import { User, Fuel, Download, Upload, Info, ChevronRight, AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import { exportBackup, importBackup } from '@/lib/store'

export function SettingsPage() {
  const { data, updateSettings, setData } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(data.userName)
  const [defaultPrice, setDefaultPrice] = useState(data.defaultFuelPrice.toString())
  const [nameSaved, setNameSaved] = useState(false)
  const [priceSaved, setPriceSaved] = useState(false)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [showBackupConfirm, setShowBackupConfirm] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  function saveName() {
    if (!name.trim()) return
    updateSettings({ userName: name.trim() })
    setNameSaved(true)
    toast('Name updated')
    setTimeout(() => setNameSaved(false), 2000)
  }

  function savePrice() {
    const price = parseFloat(defaultPrice)
    if (isNaN(price) || price <= 0) return
    updateSettings({ defaultFuelPrice: price })
    setPriceSaved(true)
    toast('Default price updated')
    setTimeout(() => setPriceSaved(false), 2000)
  }

  function handleBackup() {
    exportBackup(data)
    setShowBackupConfirm(false)
    toast('Backup downloaded')
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setShowRestoreConfirm(true)
    e.target.value = ''
  }

  async function handleRestore() {
    if (!pendingFile) return
    try {
      const restored = await importBackup(pendingFile)
      setData(restored)
      toast('Data restored successfully')
    } catch {
      toast('Failed to restore: invalid backup file')
    }
    setPendingFile(null)
    setShowRestoreConfirm(false)
  }

  const inputClass = "flex-1 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your preferences</p>
      </div>

      <div className="px-5 pb-32 flex flex-col gap-5">
        {/* Profile */}
        <section className="clay-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} strokeWidth={1.75} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Profile</h2>
          </div>
          <div>
            <label htmlFor="userName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Your Name
            </label>
            <div className="flex gap-2">
              <input
                id="userName"
                value={name}
                onChange={e => { setName(e.target.value); setNameSaved(false) }}
                placeholder="Your name"
                className={inputClass}
              />
              <button
                onClick={saveName}
                disabled={!name.trim()}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
                style={{ background: nameSaved ? 'oklch(0.65 0.15 145)' : 'oklch(0.55 0.18 250)', boxShadow: `0 4px 12px ${nameSaved ? 'oklch(0.65 0.15 145 / 0.3)' : 'oklch(0.55 0.18 250 / 0.3)'}` }}
                aria-label="Save name"
              >
                {nameSaved
                  ? <Check size={16} strokeWidth={2} className="text-white" />
                  : <ChevronRight size={16} strokeWidth={2} className="text-white" />
                }
              </button>
            </div>
          </div>
        </section>

        {/* Fuel preferences */}
        <section className="clay-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Fuel size={16} strokeWidth={1.75} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Fuel Preferences</h2>
          </div>
          <div>
            <label htmlFor="defaultPrice" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Default Fuel Price (₹/L)
            </label>
            <div className="flex gap-2">
              <input
                id="defaultPrice"
                type="number"
                value={defaultPrice}
                onChange={e => { setDefaultPrice(e.target.value); setPriceSaved(false) }}
                placeholder="e.g. 105"
                className={inputClass}
              />
              <button
                onClick={savePrice}
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
                style={{ background: priceSaved ? 'oklch(0.65 0.15 145)' : 'oklch(0.55 0.18 250)', boxShadow: `0 4px 12px ${priceSaved ? 'oklch(0.65 0.15 145 / 0.3)' : 'oklch(0.55 0.18 250 / 0.3)'}` }}
                aria-label="Save price"
              >
                {priceSaved
                  ? <Check size={16} strokeWidth={2} className="text-white" />
                  : <ChevronRight size={16} strokeWidth={2} className="text-white" />
                }
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Used as the default price when adding fuel entries.
            </p>
          </div>
        </section>

        {/* Backup & Restore */}
        <section className="clay-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Download size={16} strokeWidth={1.75} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">Data Backup</h2>
          </div>

          <button
            onClick={() => setShowBackupConfirm(true)}
            className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
          >
            <Download size={16} strokeWidth={1.75} /> Backup Data
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full py-3.5 rounded-2xl font-semibold text-foreground text-sm flex items-center justify-center gap-2 bg-secondary transition-all active:scale-95"
          >
            <Upload size={16} strokeWidth={1.75} /> Restore from Backup
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />

          <div className="flex items-start gap-2 p-3 rounded-xl bg-[oklch(0.95_0.05_25)] text-[oklch(0.45_0.18_25)]">
            <AlertTriangle size={13} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed font-medium">
              Your data is stored locally on this device. Backup regularly to avoid data loss.
            </p>
          </div>
        </section>

        {/* App info */}
        <section className="clay-card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} strokeWidth={1.75} className="text-primary" />
            <h2 className="text-sm font-bold text-foreground">About</h2>
          </div>
          {[
            { label: 'App Name', value: 'AutoTrackPro' },
            { label: 'Version', value: '2.0.0' },
            { label: 'Storage', value: 'Local (device only)' },
            { label: 'Vehicles', value: `${data.vehicles.length}` },
            { label: 'Fuel Logs', value: `${data.fuelLogs.length}` },
            { label: 'Service Logs', value: `${data.serviceLogs.length}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-sm font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </section>
      </div>

      {/* Backup confirmation dialog */}
      {showBackupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-6">
          <div className="clay-card w-full max-w-xs p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-foreground">Backup Data</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This will save your data as a JSON file to your device.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowBackupConfirm(false)} className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-secondary text-foreground">Cancel</button>
              <button
                onClick={handleBackup}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 12px oklch(0.55 0.18 250 / 0.3)' }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore warning dialog */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-6">
          <div className="clay-card w-full max-w-xs p-6 flex flex-col gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[oklch(0.95_0.05_25)] flex items-center justify-center">
              <AlertTriangle size={20} strokeWidth={1.75} className="text-[oklch(0.45_0.18_25)]" />
            </div>
            <h3 className="text-base font-bold text-foreground">Restore Data?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Restoring will replace all current data with the backup. This cannot be undone. Please proceed carefully.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowRestoreConfirm(false); setPendingFile(null) }} className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-secondary text-foreground">Cancel</button>
              <button
                onClick={handleRestore}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-destructive"
                style={{ boxShadow: '0 4px 12px oklch(0.58 0.22 25 / 0.3)' }}
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
