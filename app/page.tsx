import { AppProvider } from '@/lib/context'
import { AppShell } from '@/components/AppShell'

export default function Page() {
  return (
    <AppProvider>
      <main className="max-w-md mx-auto min-h-screen relative">
        <AppShell />
      </main>
    </AppProvider>
  )
}
