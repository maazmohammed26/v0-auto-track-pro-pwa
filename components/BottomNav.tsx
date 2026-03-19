'use client'

import { Home, BarChart2, Settings, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'home' | 'insights' | 'products' | 'settings'

interface BottomNavProps {
  active: Tab
  onChange: (tab: Tab) => void
}

const tabs: { id: Tab; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string }[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'insights', icon: BarChart2, label: 'Insights' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-3"
      style={{
        background: 'white',
        borderRadius: '32px',
        boxShadow: '0 4px 24px oklch(0.22 0.01 260 / 0.12), 0 1px 6px oklch(0.22 0.01 260 / 0.08)',
        width: 'min(320px, calc(100vw - 32px))',
      }}
      aria-label="Main navigation"
    >
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 px-3 rounded-3xl transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-semibold tracking-wide leading-none">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
