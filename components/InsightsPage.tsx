'use client'

import { useState, useMemo } from 'react'
import { TrendingUp, Fuel, Wrench, Zap, BarChart2, Navigation } from 'lucide-react'
import { useApp } from '@/lib/context'
import { getTotalDistanceDriven, calculateKmPerLiter, calculateKmPerCharge } from '@/lib/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Timeframe = 'weekly' | 'monthly' | 'all'

function filterByTimeframe<T extends { date: string }>(items: T[], timeframe: Timeframe): T[] {
  if (timeframe === 'all') return items
  const now = new Date()
  const cutoff = new Date()
  if (timeframe === 'weekly') cutoff.setDate(now.getDate() - 7)
  else cutoff.setMonth(now.getMonth() - 1)
  return items.filter(i => new Date(i.date) >= cutoff)
}

function fmt(n: number) { return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` }

const COLORS = ['oklch(0.55 0.18 250)', 'oklch(0.65 0.15 145)', 'oklch(0.68 0.14 60)', 'oklch(0.60 0.16 310)']

export function InsightsPage() {
  const { data } = useApp()
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly')

  const { totalFuel, totalService, totalCharging, totalAll, totalDistance, perVehicle, fuelEfficiency, chartData } = useMemo(() => {
    const filteredFuel = filterByTimeframe(data.fuelLogs, timeframe)
    const filteredService = filterByTimeframe(data.serviceLogs, timeframe)
    const filteredCharging = filterByTimeframe(data.chargingLogs, timeframe)

    const totalFuel = filteredFuel.reduce((s, l) => s + l.amount, 0)
    const totalService = filteredService.reduce((s, l) => s + l.expense, 0)
    const totalCharging = filteredCharging.reduce((s, l) => s + l.amountSpent, 0)
    const totalAll = totalFuel + totalService + totalCharging
    const totalDistance = getTotalDistanceDriven(data.vehicles, filteredFuel, filteredCharging)

    const perVehicle = data.vehicles.map((v, i) => {
      const vFuel = filteredFuel.filter(l => l.vehicleId === v.id)
      const vService = filteredService.filter(l => l.vehicleId === v.id)
      const vCharging = filteredCharging.filter(l => l.vehicleId === v.id)
      const fuelCost = vFuel.reduce((s, l) => s + l.amount, 0)
      const serviceCost = vService.reduce((s, l) => s + l.expense, 0)
      const chargingCost = vCharging.reduce((s, l) => s + l.amountSpent, 0)

      // Fuel efficiency: if logs have odometer readings, compute km/l
      let kmpl: number | null = null
      if (v.fuelType !== 'electric' && vFuel.length >= 2) {
        const withOdo = vFuel.filter(l => l.odometer).sort((a, b) => (a.odometer ?? 0) - (b.odometer ?? 0))
        if (withOdo.length >= 2) {
          const totalKm = (withOdo[withOdo.length - 1].odometer ?? 0) - (withOdo[0].odometer ?? 0)
          const totalLitres = withOdo.slice(1).reduce((s, l) => s + l.litres, 0)
          if (totalLitres > 0 && totalKm > 0) kmpl = totalKm / totalLitres
        }
      }

      return { vehicle: v, fuelCost, serviceCost, chargingCost, total: fuelCost + serviceCost + chargingCost, kmpl, color: COLORS[i % COLORS.length] }
    })

    // Chart: per vehicle bar data
    const chartData = perVehicle.map(pv => ({
      name: pv.vehicle.name.length > 8 ? pv.vehicle.name.slice(0, 8) + '…' : pv.vehicle.name,
      Fuel: Math.round(pv.fuelCost),
      Service: Math.round(pv.serviceCost),
      Charging: Math.round(pv.chargingCost),
      color: pv.color,
    }))

    return { totalFuel, totalService, totalCharging, totalAll, totalDistance, perVehicle, fuelEfficiency: perVehicle.map(p => p.kmpl), chartData }
  }, [data, timeframe])

  const timeframes: { id: Timeframe; label: string }[] = [
    { id: 'weekly', label: 'This week' },
    { id: 'monthly', label: 'This month' },
    { id: 'all', label: 'All time' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Your expense overview</p>
      </div>

      {/* Timeframe filter */}
      <div className="px-5 mb-5">
        <div className="flex gap-2 p-1 bg-secondary rounded-2xl">
          {timeframes.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTimeframe(id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                timeframe === id ? 'bg-card text-foreground' : 'text-muted-foreground'
              }`}
              style={timeframe === id ? { boxShadow: 'var(--shadow-clay)' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-36 flex flex-col gap-4">
        {/* Total summary */}
        <div className="clay-card p-5">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Spend</p>
          <p className="text-3xl font-bold text-foreground mb-4">{fmt(totalAll)}</p>
          <div className="flex gap-4">
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[oklch(0.93_0.06_250)] flex items-center justify-center">
                <Fuel size={14} strokeWidth={1.75} className="text-[oklch(0.38_0.12_250)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fuel</p>
                <p className="text-sm font-bold text-foreground">{fmt(totalFuel)}</p>
              </div>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[oklch(0.93_0.05_145)] flex items-center justify-center">
                <Wrench size={14} strokeWidth={1.75} className="text-[oklch(0.36_0.09_145)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="text-sm font-bold text-foreground">{fmt(totalService)}</p>
              </div>
            </div>
            {totalCharging > 0 && (
              <div className="flex-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[oklch(0.93_0.05_180)] flex items-center justify-center">
                  <Zap size={14} strokeWidth={1.75} className="text-[oklch(0.36_0.09_180)]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Charging</p>
                  <p className="text-sm font-bold text-foreground">{fmt(totalCharging)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total Distance KPI */}
        {totalDistance > 0 && (
          <div className="clay-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">Total Distance</p>
                <p className="text-3xl font-bold text-foreground">{totalDistance.toLocaleString('en-IN')} km</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[oklch(0.93_0.06_250)] flex items-center justify-center">
                <Navigation size={24} strokeWidth={1.5} className="text-[oklch(0.38_0.12_250)]" />
              </div>
            </div>
          </div>
        )}

        {/* Bar chart */}
        {chartData.length > 0 && (
          <div className="clay-card p-5">
            <p className="text-sm font-bold text-foreground mb-4">Per Vehicle</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chartData} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'oklch(0.52 0.01 260)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px oklch(0.22 0.01 260 / 0.12)', fontSize: 12, fontWeight: 600 }}
                />
                <Bar dataKey="Fuel" radius={[6, 6, 0, 0]} fill="oklch(0.55 0.18 250)" />
                <Bar dataKey="Service" radius={[6, 6, 0, 0]} fill="oklch(0.65 0.15 145)" />
                <Bar dataKey="Charging" radius={[6, 6, 0, 0]} fill="oklch(0.62 0.14 180)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.55 0.18 250)' }} />
                <span className="text-xs text-muted-foreground font-medium">Fuel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.65 0.15 145)' }} />
                <span className="text-xs text-muted-foreground font-medium">Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'oklch(0.62 0.14 180)' }} />
                <span className="text-xs text-muted-foreground font-medium">Charging</span>
              </div>
            </div>
          </div>
        )}

        {/* Per vehicle breakdown */}
        {perVehicle.length === 0 ? (
          <div className="clay-card p-10 flex flex-col items-center gap-3 text-center">
            <BarChart2 size={36} strokeWidth={1.5} className="text-muted-foreground" />
            <p className="font-semibold text-foreground">No data yet</p>
            <p className="text-muted-foreground text-sm leading-relaxed">Add vehicles and log fuel or service entries to see your insights here.</p>
          </div>
        ) : (
          perVehicle.map(({ vehicle, fuelCost, serviceCost, chargingCost, total, kmpl }) => (
            <div key={vehicle.id} className="clay-card p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground text-sm">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                </div>
                <p className="text-base font-bold text-foreground">{fmt(total)}</p>
              </div>

              <div className="flex gap-3">
                {vehicle.fuelType !== 'electric' && (
                  <div className="flex-1 bg-secondary rounded-2xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Fuel size={12} strokeWidth={1.75} className="text-primary" />
                      <p className="text-[10px] text-muted-foreground font-medium">Fuel</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{fmt(fuelCost)}</p>
                  </div>
                )}
                <div className="flex-1 bg-secondary rounded-2xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Wrench size={12} strokeWidth={1.75} className="text-primary" />
                    <p className="text-[10px] text-muted-foreground font-medium">Service</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">{fmt(serviceCost)}</p>
                </div>
                {vehicle.fuelType === 'electric' && chargingCost > 0 && (
                  <div className="flex-1 bg-[oklch(0.93_0.05_180)] rounded-2xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap size={12} strokeWidth={1.75} className="text-[oklch(0.36_0.09_180)]" />
                      <p className="text-[10px] text-[oklch(0.36_0.09_180)] font-medium">Charging</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{fmt(chargingCost)}</p>
                  </div>
                )}
                {kmpl && (
                  <div className="flex-1 bg-secondary rounded-2xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp size={12} strokeWidth={1.75} className="text-primary" />
                      <p className="text-[10px] text-muted-foreground font-medium">km/L</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{kmpl.toFixed(1)}</p>
                  </div>
                )}
                {vehicle.fuelType === 'electric' && chargingCost === 0 && (
                  <div className="flex-1 bg-[oklch(0.93_0.05_180)] rounded-2xl p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap size={12} strokeWidth={1.75} className="text-[oklch(0.36_0.09_180)]" />
                      <p className="text-[10px] text-[oklch(0.36_0.09_180)] font-medium">Electric</p>
                    </div>
                    <p className="text-xs text-[oklch(0.36_0.09_180)] font-semibold">No charging logs</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
