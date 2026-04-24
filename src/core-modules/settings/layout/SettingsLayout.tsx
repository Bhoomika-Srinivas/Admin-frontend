import { Outlet } from 'react-router-dom'
import SettingsNav from '../components/SettingsNav'

export default function SettingsLayout() {
  return (
    <div className="-m-4 lg:-m-6 flex min-h-[calc(100vh-56px)]">
      {/* Secondary settings nav */}
      <aside className="w-52 shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-3 pt-4">
          <p className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Settings
          </p>
          <SettingsNav />
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 lg:p-6 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
