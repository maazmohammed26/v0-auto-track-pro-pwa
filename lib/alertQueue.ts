export type AlertType = 'document_expiry' | 'km_reminder' | 'date_reminder'

export interface Alert {
  id: string
  type: AlertType
  title: string
  message: string
  relatedId?: string // vehicleId or documentId
  actions: {
    primary: { label: string; action: () => void }
    secondary?: { label: string; action: () => void }
  }
}

export interface SnoozeState {
  alertId: string
  snoozedUntil: string
}

const ALERT_QUEUE_KEY = 'autotrackpro_alert_queue'
const SNOOZE_STATE_KEY = 'autotrackpro_snooze_state'

export function saveAlertQueue(alerts: Alert[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ALERT_QUEUE_KEY, JSON.stringify(alerts))
  } catch (e) {
    console.error('Failed to save alert queue:', e)
  }
}

export function loadAlertQueue(): Alert[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ALERT_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to load alert queue:', e)
    return []
  }
}

export function clearAlertQueue(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ALERT_QUEUE_KEY)
  } catch (e) {
    console.error('Failed to clear alert queue:', e)
  }
}

export function saveSnoozeState(snoozes: SnoozeState[]): void {
  if (typeof window === 'undefined') return
  try {
    // Clean expired snooozes
    const now = Date.now()
    const validSnozes = snoozes.filter(s => new Date(s.snoozedUntil).getTime() > now)
    localStorage.setItem(SNOOZE_STATE_KEY, JSON.stringify(validSnozes))
  } catch (e) {
    console.error('Failed to save snooze state:', e)
  }
}

export function loadSnoozeState(): SnoozeState[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SNOOZE_STATE_KEY)
    if (!raw) return []
    
    const snozes = JSON.parse(raw) as SnoozeState[]
    const now = Date.now()
    
    // Filter out expired snozes
    return snozes.filter(s => new Date(s.snoozedUntil).getTime() > now)
  } catch (e) {
    console.error('Failed to load snooze state:', e)
    return []
  }
}

export function isSnoozed(alertId: string): boolean {
  const snozes = loadSnoozeState()
  return snozes.some(s => s.alertId === alertId)
}

export function snoozeAlert(alertId: string, hours: number = 12): void {
  const snozes = loadSnoozeState()
  const now = Date.now()
  const snoozedUntil = new Date(now + hours * 60 * 60 * 1000).toISOString()
  
  // Remove existing snooze for this alert
  const filtered = snozes.filter(s => s.alertId !== alertId)
  filtered.push({ alertId, snoozedUntil })
  
  saveSnoozeState(filtered)
}

export function removeSnooze(alertId: string): void {
  const snozes = loadSnoozeState()
  const filtered = snozes.filter(s => s.alertId !== alertId)
  saveSnoozeState(filtered)
}

export function dismissAlert(alert: Alert, snozes: SnoozeState[]): void {
  const queue = loadAlertQueue()
  const filtered = queue.filter(a => a.id !== alert.id)
  saveAlertQueue(filtered)
  
  // Also remove any snooze for this alert
  removeSnooze(alert.id)
}

export function addAlert(alert: Alert): void {
  const queue = loadAlertQueue()
  // Don't add duplicate alerts
  if (!queue.some(a => a.id === alert.id)) {
    queue.push(alert)
    saveAlertQueue(queue)
  }
}

export function getNextAlert(alertQueue: Alert[], snoozeState: SnoozeState[]): Alert | null {
  for (const alert of alertQueue) {
    if (!isSnoozed(alert.id)) {
      return alert
    }
  }
  return null
}
