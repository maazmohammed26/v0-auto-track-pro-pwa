'use client'

import { useState, useEffect } from 'react'
import { Car, Bike } from 'lucide-react'

// Custom Scooty icon since Lucide doesn't have one
function ScootyIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="5" cy="17" r="2.5" />
      <circle cx="19" cy="17" r="2.5" />
      <path d="M5 14.5V12a2 2 0 0 1 2-2h3l2 4h3" />
      <path d="M15 10l1.5-3H19" />
      <path d="M7.5 17h9" />
      <path d="M12 10v4" />
    </svg>
  )
}

const vehicles = [
  { icon: Car, label: 'Car' },
  { icon: Bike, label: 'Bike' },
  { icon: ScootyIcon, label: 'Scooty' },
]

export function LoadingScreen() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Cycle through vehicles
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % vehicles.length)
    }, 600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Progress bar animation
    const start = Date.now()
    const duration = 1800
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / duration) * 100)
      setProgress(pct)
      if (pct < 100) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6">
      {/* Animated vehicle icons */}
      <div className="relative w-24 h-24">
        {vehicles.map(({ icon: Icon }, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center transition-all duration-300"
            style={{
              opacity: activeIndex === i ? 1 : 0,
              transform: activeIndex === i ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(10px)',
            }}
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'oklch(0.55 0.18 250)',
                boxShadow: '0 8px 32px oklch(0.55 0.18 250 / 0.4)',
              }}
            >
              <Icon size={40} strokeWidth={1.5} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* App name */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">AutoTrackPro</h1>
        <p className="text-muted-foreground text-sm mt-1">Loading your vehicles...</p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            background: 'oklch(0.55 0.18 250)',
          }}
        />
      </div>

      {/* Dot indicators */}
      <div className="flex gap-2">
        {vehicles.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: activeIndex === i ? 'oklch(0.55 0.18 250)' : 'oklch(0.88 0.02 80)',
              transform: activeIndex === i ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
