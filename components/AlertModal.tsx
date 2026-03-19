'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Clock } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import type { Alert } from '@/lib/alertQueue'

interface AlertModalProps {
  alert: Alert | null
  onDismiss: () => void
  onSnooze: () => void
}

export function AlertModal({ alert, onDismiss, onSnooze }: AlertModalProps) {
  const [isOpen, setIsOpen] = useState(!!alert)

  useEffect(() => {
    setIsOpen(!!alert)
  }, [alert])

  const handleDismiss = () => {
    alert?.actions.primary.action?.()
    onDismiss()
    setIsOpen(false)
  }

  const handleSnooze = () => {
    alert?.actions.secondary?.action?.()
    onSnooze()
    setIsOpen(false)
  }

  if (!alert) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="bg-background border border-border shadow-2xl">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[oklch(0.93_0.05_60)] flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle size={20} strokeWidth={1.75} className="text-[oklch(0.42_0.10_60)]" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-base font-bold text-foreground">{alert.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {alert.message}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-2 pt-2">
          {alert.actions.secondary ? (
            <>
              <button
                onClick={handleSnooze}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <Clock size={16} strokeWidth={1.75} />
                {alert.actions.secondary.label}
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {alert.actions.primary.label}
              </button>
            </>
          ) : (
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {alert.actions.primary.label}
            </button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
