'use client'

import { Download, X, Smartphone } from 'lucide-react'

interface PwaInstallPromptProps {
  onDismiss: () => void
}

export function PwaInstallPrompt({ onDismiss }: PwaInstallPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 backdrop-blur-[2px] p-4">
      <div
        className="w-full max-w-sm bg-card rounded-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300"
        style={{ boxShadow: 'var(--shadow-clay-lg)' }}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={1.75} className="text-muted-foreground" />
        </button>

        {/* Icon */}
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.35)' }}
          >
            <Smartphone size={24} strokeWidth={1.5} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Install AutoTrackPro</h3>
            <p className="text-sm text-muted-foreground leading-snug">
              Add to home screen for a better experience
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-secondary rounded-2xl p-4 flex flex-col gap-2">
          {[
            'Works offline',
            'Faster loading',
            'Quick access from home screen',
          ].map((benefit, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-sm text-foreground">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground mb-1">How to install:</p>
          <p>Tap the share button in your browser, then select &quot;Add to Home Screen&quot; or &quot;Install&quot;.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-secondary text-foreground transition-all active:scale-95"
          >
            Maybe Later
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 12px oklch(0.55 0.18 250 / 0.3)' }}
          >
            <Download size={16} strokeWidth={2} /> Got it
          </button>
        </div>
      </div>
    </div>
  )
}
