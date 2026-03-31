export const dynamic = 'force-dynamic'

import { ClientNav } from '@/components/layout/ClientNav'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ClientNav />
      <main className="flex-1 pb-20 sm:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
      </main>
    </div>
  )
}
