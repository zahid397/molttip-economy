import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-56px)] grid lg:grid-cols-[280px_1fr] gap-6">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-14">
          <Sidebar />
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0">
        {children}
      </main>

    </div>
  )
}
