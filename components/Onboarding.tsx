'use client'

import { useState } from 'react'
import { Gauge, Fuel, Wrench, TrendingUp, ChevronRight } from 'lucide-react'
import { useApp } from '@/lib/context'

const features = [
  { icon: Gauge, label: 'Track odometer', desc: 'Daily readings with smart reminders' },
  { icon: Fuel, label: 'Fuel logs', desc: 'Auto-calculate litres and costs' },
  { icon: Wrench, label: 'Service history', desc: 'Never miss a maintenance date' },
  { icon: TrendingUp, label: 'Insights', desc: 'Fuel efficiency and expense trends' },
]

export function Onboarding() {
  const { completeOnboarding } = useApp()
  const [step, setStep] = useState<'welcome' | 'name'>('welcome')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name'); return }
    completeOnboarding(trimmed)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {step === 'welcome' ? (
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 8px 24px oklch(0.55 0.18 250 / 0.35)' }}
            >
              <Gauge size={38} strokeWidth={1.5} className="text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">AutoTrackPro</h1>
              <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                Your personal vehicle companion
              </p>
            </div>
          </div>

          {/* Feature list */}
          <div className="w-full clay-card p-5 flex flex-col gap-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                  <Icon size={18} strokeWidth={1.75} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm leading-snug">{label}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('name')}
            className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.35)' }}
          >
            Get Started <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 8px 24px oklch(0.55 0.18 250 / 0.35)' }}
            >
              <Gauge size={30} strokeWidth={1.5} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">What should we call you?</h2>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              We'll personalise your experience with your name.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full clay-card p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="userName" className="text-sm font-semibold text-foreground">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                placeholder="e.g. Ravi"
                className="w-full px-4 py-3.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground font-medium text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                autoFocus
              />
              {error && <p className="text-destructive text-xs font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all active:scale-95"
              style={{ background: 'oklch(0.55 0.18 250)', boxShadow: '0 4px 16px oklch(0.55 0.18 250 / 0.35)' }}
            >
              Continue
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
