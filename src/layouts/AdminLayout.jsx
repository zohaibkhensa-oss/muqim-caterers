import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Kanban, CalendarDays, BookOpen, Users,
  ChefHat, BarChart3, Truck, ExternalLink, LogOut, Inbox, ListChecks,
} from 'lucide-react'
import { supabaseReady } from '@/lib/supabase'
import { auth } from '@/lib/db'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/leads', label: 'Lead Inbox', icon: Inbox },
  { to: '/admin/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/admin/bookings', label: 'Bookings', icon: Kanban },
  { to: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/admin/menus', label: 'Menus', icon: BookOpen },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/staff', label: 'Staff', icon: ChefHat },
  { to: '/admin/vendors', label: 'Vendors', icon: Truck },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

const titles = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/calendar': 'Calendar',
  '/admin/menus': 'Menus & Packages',
  '/admin/clients': 'Clients',
  '/admin/staff': 'Staff',
  '/admin/vendors': 'Vendors',
  '/admin/reports': 'Reports',
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titles[pathname] ?? 'Booking detail'
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    if (!supabaseReady) return
    auth.session().then(setSession)
    const { data: { subscription } } = auth.onChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (supabaseReady && session === undefined) {
    return <div className="min-h-screen grid place-items-center bg-stone-100 text-sm text-stone-400">Loading…</div>
  }
  if (supabaseReady && !session) return <Navigate to="/admin/login" replace />

  const signOut = async () => {
    await auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-stone-100">
      <aside className="w-60 shrink-0 bg-teal-950 text-cream-200 flex flex-col fixed inset-y-0">
        <Link to="/admin" className="flex items-center gap-3 px-5 h-16 border-b border-teal-800 text-cream-50">
          <img src="/logo.jpeg" alt="Muqim Caterer's" className="h-10 w-auto rounded-md bg-white object-contain" />
          <div className="leading-tight">
            <span className="font-display font-semibold block">Muqim</span>
            <span className="text-[11px] text-cream-300/70 uppercase tracking-wider">Management</span>
          </div>
        </Link>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 text-sm">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  isActive ? 'bg-teal-700 text-cream-50' : 'text-cream-300/80 hover:bg-teal-800 hover:text-cream-50'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cream-300/70 hover:bg-teal-800 hover:text-cream-50"
          >
            <ExternalLink size={15} /> View storefront
          </Link>
        </div>
      </aside>

      <div className="flex-1 ml-60 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <h1 className="font-display text-xl font-semibold text-teal-900">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500 hidden sm:block">
              {session?.user?.email ?? 'Muqim Admin'}
            </span>
            {session && (
              <button onClick={signOut} title="Sign out" className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100">
                <LogOut size={17} />
              </button>
            )}
            <span className="w-9 h-9 rounded-full bg-teal-700 text-cream-50 grid place-items-center text-sm font-semibold">M</span>
          </div>
        </header>
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
