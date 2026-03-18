'use client'

import { useState } from 'react'
import { ArrowLeft, Fuel, Wrench, Gauge, Edit2, Trash2, Plus, Zap, Bell, FileText, Check, ExternalLink, AlertTriangle, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useApp } from '@/lib/context'
import type { Vehicle, FuelLog, ServiceLog, Reminder, VehicleDocument } from '@/lib/store'
import { isReminderOverdue, getReminderDaysUntil, isDocumentExpired, isDocumentExpiringSoon } from '@/lib/store'
import { FuelLogForm } from './FuelLogForm'
import { ServiceLogForm } from './ServiceLogForm'
import { AddVehicleForm } from './AddVehicleForm'
import { ReminderForm } from './ReminderForm'
import { DocumentForm } from './DocumentForm'

interface VehicleDetailProps {
  vehicleId: string
  onBack: () => void
}

type ActiveTab = 'overview' | 'fuel' | 'service' | 'reminders' | 'documents'

const fuelBadge = {
  petrol: { label: 'Petrol', bg: 'bg-[oklch(0.93_0.06_250)]', text: 'text-[oklch(0.38_0.12_250)]' },
  diesel: { label: 'Diesel', bg: 'bg-[oklch(0.93_0.05_60)]', text: 'text-[oklch(0.42_0.10_60)]' },
  'petrol+cng': { label: 'Petrol + CNG', bg: 'bg-[oklch(0.93_0.05_145)]', text: 'text-[oklch(0.36_0.09_145)]' },
  electric: { label: 'Electric', bg: 'bg-[oklch(0.93_0.05_180)]', text: 'text-[oklch(0.36_0.09_180)]' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ConfirmDeleteDialog({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-6">
      <div className="clay-card w-full max-w-xs p-6 flex flex-col gap-4">
        <h3 className="text-base font-bold text-foreground">Delete {label}?</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This action cannot be undone. All associated data will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-secondary text-foreground">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-destructive"
            style={{ boxShadow: '0 4px 12px oklch(0.58 0.22 25 / 0.3)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function ExternalLinkWarning({ url, onConfirm, onCancel }: { url: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/25 backdrop-blur-[2px] p-6">
      <div className="clay-card w-full max-w-xs p-6 flex flex-col gap-4">
        <div className="w-10 h-10 rounded-2xl bg-[oklch(0.93_0.05_60)] flex items-center justify-center">
          <ExternalLink size={20} strokeWidth={1.75} className="text-[oklch(0.42_0.10_60)]" />
        </div>
        <h3 className="text-base font-bold text-foreground">Open External Link?</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          You are about to open an external link. Make sure you trust this source before proceeding.
        </p>
        <p className="text-xs text-foreground font-mono bg-secondary p-2 rounded-lg break-all">{url}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-secondary text-foreground">Cancel</button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 12px oklch(0.55 0.18 250 / 0.3)' }}
          >
            Open Link
          </button>
        </div>
      </div>
    </div>
  )
}

export function VehicleDetail({ vehicleId, onBack }: VehicleDetailProps) {
  const { data, deleteVehicle, deleteFuelLog, deleteServiceLog, deleteReminder, completeReminder, deleteDocument } = useApp()
  const vehicle = data.vehicles.find(v => v.id === vehicleId)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [showFuelForm, setShowFuelForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [showEditVehicle, setShowEditVehicle] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [editFuelLog, setEditFuelLog] = useState<FuelLog | undefined>()
  const [editServiceLog, setEditServiceLog] = useState<ServiceLog | undefined>()
  const [editReminder, setEditReminder] = useState<Reminder | undefined>()
  const [editDocument, setEditDocument] = useState<VehicleDocument | undefined>()
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'vehicle' | 'fuel' | 'service' | 'reminder' | 'document'; id?: string } | null>(null)
  const [externalLinkWarning, setExternalLinkWarning] = useState<string | null>(null)

  if (!vehicle) return null

  const fuelLogs = data.fuelLogs.filter(l => l.vehicleId === vehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const serviceLogs = data.serviceLogs.filter(l => l.vehicleId === vehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const reminders = data.reminders.filter(r => r.vehicleId === vehicleId).sort((a, b) => {
    // Sort: incomplete first (by due date), then completed
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
  const documents = data.documents.filter(d => d.vehicleId === vehicleId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  const isElectric = vehicle.fuelType === 'electric'
  const badge = fuelBadge[vehicle.fuelType]
  const overdueCount = reminders.filter(r => !r.isCompleted && isReminderOverdue(r)).length

  function handleDeleteVehicle() {
    deleteVehicle(vehicleId)
    toast('Vehicle deleted')
    onBack()
  }

  function handleOpenLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    setExternalLinkWarning(null)
  }

  const tabs: { id: ActiveTab; label: string; hidden?: boolean; badge?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'fuel', label: 'Fuel', hidden: isElectric },
    { id: 'service', label: 'Service' },
    { id: 'reminders', label: 'Reminders', badge: overdueCount > 0 ? overdueCount : undefined },
    { id: 'documents', label: 'Documents' },
  ].filter(t => !t.hidden)

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-background">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-2xl bg-card flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-clay)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={18} strokeWidth={1.75} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{vehicle.name}</h1>
          <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
        </div>
        <button
          onClick={() => setShowEditVehicle(true)}
          className="w-9 h-9 rounded-2xl bg-card flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-clay)' }}
          aria-label="Edit vehicle"
        >
          <Edit2 size={16} strokeWidth={1.75} className="text-foreground" />
        </button>
        <button
          onClick={() => setConfirmDelete({ type: 'vehicle' })}
          className="w-9 h-9 rounded-2xl bg-[oklch(0.95_0.05_25)] flex items-center justify-center"
          aria-label="Delete vehicle"
        >
          <Trash2 size={16} strokeWidth={1.75} className="text-destructive" />
        </button>
      </div>

      {/* Tabs - Scrollable */}
      <div className="px-4 mb-4">
        <div className="flex gap-1.5 p-1 bg-secondary rounded-2xl overflow-x-auto hide-scrollbar">
          {tabs.map(({ id, label, badge: tabBadge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === id ? 'bg-card text-foreground' : 'text-muted-foreground'
              }`}
              style={activeTab === id ? { boxShadow: 'var(--shadow-clay)' } : {}}
            >
              {label}
              {tabBadge && tabBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                  {tabBadge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-10">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            {/* Odometer card */}
            <div className="clay-card p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <Gauge size={24} strokeWidth={1.75} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">Current Odometer</p>
                <p className="text-2xl font-bold text-foreground">{vehicle.currentOdometer.toLocaleString('en-IN')} <span className="text-sm font-medium text-muted-foreground">km</span></p>
              </div>
            </div>

            {/* Vehicle info */}
            <div className="clay-card p-5 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-foreground">Vehicle Info</h3>
              {[
                { label: 'Brand', value: vehicle.brand },
                { label: 'Model', value: vehicle.model },
                { label: 'Type', value: vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) },
                { label: 'Added On', value: formatDate(vehicle.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-semibold text-foreground">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fuel Type</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>{badge.label}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="clay-card p-4 flex flex-col gap-1">
                {isElectric ? <Zap size={18} strokeWidth={1.75} className="text-primary" /> : <Fuel size={18} strokeWidth={1.75} className="text-primary" />}
                <p className="text-2xl font-bold text-foreground mt-1">{fuelLogs.length}</p>
                <p className="text-xs text-muted-foreground">{isElectric ? 'Charge logs' : 'Fuel entries'}</p>
              </div>
              <div className="clay-card p-4 flex flex-col gap-1">
                <Wrench size={18} strokeWidth={1.75} className="text-primary" />
                <p className="text-2xl font-bold text-foreground mt-1">{serviceLogs.length}</p>
                <p className="text-xs text-muted-foreground">Service entries</p>
              </div>
            </div>

            {/* Active reminders summary */}
            {reminders.filter(r => !r.isCompleted).length > 0 && (
              <div className="clay-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Bell size={14} strokeWidth={1.75} className="text-primary" /> Upcoming Reminders
                  </h3>
                  <button onClick={() => setActiveTab('reminders')} className="text-xs text-primary font-semibold">View All</button>
                </div>
                <div className="flex flex-col gap-2">
                  {reminders.filter(r => !r.isCompleted).slice(0, 2).map(r => {
                    const overdue = isReminderOverdue(r)
                    const daysUntil = getReminderDaysUntil(r)
                    return (
                      <div key={r.id} className={`flex items-center justify-between p-3 rounded-xl ${overdue ? 'bg-[oklch(0.95_0.05_25)]' : 'bg-secondary'}`}>
                        <span className={`text-sm font-medium ${overdue ? 'text-destructive' : 'text-foreground'}`}>{r.title}</span>
                        <span className={`text-xs font-semibold ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {overdue ? 'Overdue' : daysUntil === 0 ? 'Today' : `${daysUntil}d`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Last service */}
            {serviceLogs.length > 0 && (
              <div className="clay-card p-5">
                <p className="text-xs text-muted-foreground mb-1">Last Service</p>
                <p className="text-sm font-bold text-foreground">{serviceLogs[0].serviceType}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(serviceLogs[0].date)} - Rs.{serviceLogs[0].expense.toLocaleString('en-IN')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fuel' && !isElectric && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowFuelForm(true)}
              className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
            >
              <Plus size={16} strokeWidth={2} /> Add Fuel Entry
            </button>

            {fuelLogs.length === 0 ? (
              <div className="clay-card p-8 text-center">
                <Fuel size={32} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-semibold mb-1">No fuel logs yet</p>
                <p className="text-muted-foreground text-sm">Add your first fuel entry above.</p>
              </div>
            ) : (
              fuelLogs.map(log => (
                <div key={log.id} className="clay-card p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground">Rs.{log.amount.toLocaleString('en-IN')}</p>
                      <span className="text-xs text-muted-foreground">- {log.litres.toFixed(2)} L</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(log.date)} - Rs.{log.pricePerLitre}/L</p>
                    {log.odometer && <p className="text-xs text-muted-foreground mt-0.5">{log.odometer.toLocaleString('en-IN')} km</p>}
                    {log.notes && <p className="text-xs text-muted-foreground mt-0.5 italic truncate">{log.notes}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditFuelLog(log)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                      <Edit2 size={13} strokeWidth={1.75} className="text-foreground" />
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'fuel', id: log.id })} className="w-8 h-8 rounded-xl bg-[oklch(0.95_0.05_25)] flex items-center justify-center">
                      <Trash2 size={13} strokeWidth={1.75} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'service' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowServiceForm(true)}
              className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
            >
              <Plus size={16} strokeWidth={2} /> Add Service Entry
            </button>

            {serviceLogs.length === 0 ? (
              <div className="clay-card p-8 text-center">
                <Wrench size={32} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-semibold mb-1">No service logs yet</p>
                <p className="text-muted-foreground text-sm">Track your first maintenance entry above.</p>
              </div>
            ) : (
              serviceLogs.map(log => (
                <div key={log.id} className="clay-card p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground">{log.serviceType}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(log.date)} - Rs.{log.expense.toLocaleString('en-IN')}</p>
                    {log.odometer && <p className="text-xs text-muted-foreground mt-0.5">{log.odometer.toLocaleString('en-IN')} km</p>}
                    {log.notes && <p className="text-xs text-muted-foreground mt-0.5 italic truncate">{log.notes}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditServiceLog(log)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                      <Edit2 size={13} strokeWidth={1.75} className="text-foreground" />
                    </button>
                    <button onClick={() => setConfirmDelete({ type: 'service', id: log.id })} className="w-8 h-8 rounded-xl bg-[oklch(0.95_0.05_25)] flex items-center justify-center">
                      <Trash2 size={13} strokeWidth={1.75} className="text-destructive" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowReminderForm(true)}
              className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
            >
              <Plus size={16} strokeWidth={2} /> Add Reminder
            </button>

            {reminders.length === 0 ? (
              <div className="clay-card p-8 text-center">
                <Bell size={32} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-semibold mb-1">No reminders yet</p>
                <p className="text-muted-foreground text-sm">Set reminders for oil changes, PUC, insurance, and more.</p>
              </div>
            ) : (
              reminders.map(r => {
                const overdue = !r.isCompleted && isReminderOverdue(r)
                const daysUntil = getReminderDaysUntil(r)
                return (
                  <div
                    key={r.id}
                    className={`clay-card p-4 flex items-start justify-between gap-3 ${r.isCompleted ? 'opacity-60' : ''} ${overdue ? 'ring-2 ring-destructive/30' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-bold ${overdue ? 'text-destructive' : r.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {r.title}
                        </p>
                        {overdue && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[oklch(0.95_0.05_25)] text-destructive">
                            Overdue
                          </span>
                        )}
                        {r.isCompleted && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[oklch(0.93_0.05_145)] text-[oklch(0.36_0.09_145)]">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={11} strokeWidth={2} /> {formatDate(r.dueDate)}
                        {!r.isCompleted && !overdue && daysUntil <= 7 && (
                          <span className="text-[oklch(0.42_0.10_60)] font-medium ml-1">({daysUntil === 0 ? 'Today' : `${daysUntil}d left`})</span>
                        )}
                      </p>
                      {r.dueMileage && <p className="text-xs text-muted-foreground mt-0.5">At {r.dueMileage.toLocaleString('en-IN')} km</p>}
                      {r.notes && <p className="text-xs text-muted-foreground mt-0.5 italic truncate">{r.notes}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {!r.isCompleted && (
                        <button
                          onClick={() => { completeReminder(r.id); toast('Reminder completed') }}
                          className="w-8 h-8 rounded-xl bg-[oklch(0.93_0.05_145)] flex items-center justify-center"
                          aria-label="Mark as done"
                        >
                          <Check size={13} strokeWidth={2} className="text-[oklch(0.36_0.09_145)]" />
                        </button>
                      )}
                      <button onClick={() => setEditReminder(r)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                        <Edit2 size={13} strokeWidth={1.75} className="text-foreground" />
                      </button>
                      <button onClick={() => setConfirmDelete({ type: 'reminder', id: r.id })} className="w-8 h-8 rounded-xl bg-[oklch(0.95_0.05_25)] flex items-center justify-center">
                        <Trash2 size={13} strokeWidth={1.75} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowDocumentForm(true)}
              className="w-full py-3.5 rounded-2xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.3)' }}
            >
              <Plus size={16} strokeWidth={2} /> Add Document
            </button>

            {/* Google Drive suggestion */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[oklch(0.93_0.06_250)] text-[oklch(0.38_0.12_250)]">
              <FileText size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                <span className="font-semibold">Tip:</span> Store your documents on Google Drive and add links here for easy access. This app does not upload files.
              </p>
            </div>

            {documents.length === 0 ? (
              <div className="clay-card p-8 text-center">
                <FileText size={32} strokeWidth={1.5} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-semibold mb-1">No documents yet</p>
                <p className="text-muted-foreground text-sm">Add links to your PUC, insurance, RC and other documents.</p>
              </div>
            ) : (
              documents.map(doc => {
                const expired = isDocumentExpired(doc)
                const expiringSoon = isDocumentExpiringSoon(doc)
                return (
                  <div
                    key={doc.id}
                    className={`clay-card p-4 flex items-start justify-between gap-3 ${expired ? 'ring-2 ring-destructive/30' : expiringSoon ? 'ring-2 ring-[oklch(0.42_0.10_60)]/30' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-bold ${expired ? 'text-destructive' : 'text-foreground'}`}>{doc.title}</p>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase">
                          {doc.type}
                        </span>
                        {expired && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[oklch(0.95_0.05_25)] text-destructive">
                            Expired
                          </span>
                        )}
                        {expiringSoon && !expired && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[oklch(0.93_0.05_60)] text-[oklch(0.42_0.10_60)]">
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      {doc.expiryDate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar size={11} strokeWidth={2} /> Expires {formatDate(doc.expiryDate)}
                        </p>
                      )}
                      {doc.notes && <p className="text-xs text-muted-foreground mt-0.5 italic truncate">{doc.notes}</p>}
                      {doc.link && (
                        <button
                          onClick={() => setExternalLinkWarning(doc.link!)}
                          className="text-xs text-primary font-semibold mt-1 flex items-center gap-1"
                        >
                          <ExternalLink size={11} strokeWidth={2} /> Open Link
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditDocument(doc)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                        <Edit2 size={13} strokeWidth={1.75} className="text-foreground" />
                      </button>
                      <button onClick={() => setConfirmDelete({ type: 'document', id: doc.id })} className="w-8 h-8 rounded-xl bg-[oklch(0.95_0.05_25)] flex items-center justify-center">
                        <Trash2 size={13} strokeWidth={1.75} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showFuelForm && <FuelLogForm vehicleId={vehicleId} onClose={() => setShowFuelForm(false)} />}
      {editFuelLog && <FuelLogForm vehicleId={vehicleId} onClose={() => setEditFuelLog(undefined)} editLog={editFuelLog} />}
      {showServiceForm && <ServiceLogForm vehicleId={vehicleId} onClose={() => setShowServiceForm(false)} />}
      {editServiceLog && <ServiceLogForm vehicleId={vehicleId} onClose={() => setEditServiceLog(undefined)} editLog={editServiceLog} />}
      {showEditVehicle && <AddVehicleForm onClose={() => setShowEditVehicle(false)} editVehicle={vehicle} />}
      {showReminderForm && <ReminderForm vehicleId={vehicleId} onClose={() => setShowReminderForm(false)} />}
      {editReminder && <ReminderForm vehicleId={vehicleId} onClose={() => setEditReminder(undefined)} editReminder={editReminder} />}
      {showDocumentForm && <DocumentForm vehicleId={vehicleId} onClose={() => setShowDocumentForm(false)} />}
      {editDocument && <DocumentForm vehicleId={vehicleId} onClose={() => setEditDocument(undefined)} editDocument={editDocument} />}

      {confirmDelete && (
        <ConfirmDeleteDialog
          label={
            confirmDelete.type === 'vehicle' ? 'this vehicle' :
            confirmDelete.type === 'fuel' ? 'this fuel log' :
            confirmDelete.type === 'service' ? 'this service log' :
            confirmDelete.type === 'reminder' ? 'this reminder' : 'this document'
          }
          onConfirm={() => {
            if (confirmDelete.type === 'vehicle') handleDeleteVehicle()
            else if (confirmDelete.type === 'fuel' && confirmDelete.id) { deleteFuelLog(confirmDelete.id); toast('Fuel log deleted') }
            else if (confirmDelete.type === 'service' && confirmDelete.id) { deleteServiceLog(confirmDelete.id); toast('Service log deleted') }
            else if (confirmDelete.type === 'reminder' && confirmDelete.id) { deleteReminder(confirmDelete.id); toast('Reminder deleted') }
            else if (confirmDelete.type === 'document' && confirmDelete.id) { deleteDocument(confirmDelete.id); toast('Document deleted') }
            setConfirmDelete(null)
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {externalLinkWarning && (
        <ExternalLinkWarning
          url={externalLinkWarning}
          onConfirm={() => handleOpenLink(externalLinkWarning)}
          onCancel={() => setExternalLinkWarning(null)}
        />
      )}
    </div>
  )
}
