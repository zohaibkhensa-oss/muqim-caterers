import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Kanban, CalendarDays, BookOpen, Users,
  ChefHat, BarChart3, Truck, ExternalLink, LogOut, Inbox, ListChecks, Menu as MenuIcon, X,
} from 'lucide-react'
import { supabaseReady } from '@/lib/supabase'
import { auth } from '@/lib/db'
import { useT, LanguageToggle } from '@/lib/i18n'

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
  '/admin/leads': 'Lead Inbox',
  '/admin/tasks': 'Tasks',
}

function SideNav({ onNavigate, t }) {
  return (
    <>
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 h-16 border-b border-teal-800 text-cream-50 shrink-0">
        <img src="/logo.jpeg" alt="Muqim Caterer's" className="h-10 w-auto rounded-md bg-white object-contain" />
        <div className="leading-tight">
          <span className="font-display font-semibold block">Muqim</span>
          <span className="text-[11px] text-cream-300/70 uppercase tracking-wider">Management</span>
        </div>
      </Link>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 text-sm overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                isActive ? 'bg-teal-700 text-cream-50' : 'text-cream-300/80 hover:bg-teal-800 hover:text-cream-50'
              }`
            }
          >
            <item.icon size={17} />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4 shrink-0">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cream-300/70 hover:bg-teal-800 hover:text-cream-50"
        >
          <ExternalLink size={15} /> {t('View storefront')}
        </Link>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const t = useT()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = titles[pathname] ?? 'Booking detail'
  const [session, setSession] = useState(undefined)
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    if (!supabaseReady) return
    auth.session().then(setSession)
    const { data: { subscription } } = auth.onChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { setDrawer(false) }, [pathname])

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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-teal-950 text-cream-200 flex-col fixed inset-y-0">
        <SideNav t={t} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-teal-950/60" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-teal-950 text-cream-200 flex flex-col shadow-2xl">
            <button onClick={() => setDrawer(false)} className="absolute top-4 right-3 text-cream-300 p-1" aria-label="Close">
              <X size={20} />
            </button>
            <SideNav t={t} onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-60 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-stone-200 flex items-center gap-3 px-4 md:px-6 sticky top-0 z-30">
          <button onClick={() => setDrawer(true)} className="lg:hidden p-1.5 text-stone-600" aria-label="Menu">
            <MenuIcon size={21} />
          </button>
          <h1 className="font-display text-lg md:text-xl font-semibold text-teal-900 truncate flex-1">{t(title)}</h1>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <LanguageToggle />
            <span className="text-sm text-stone-500 hidden md:block max-w-[160px] truncate">
              {session?.user?.email ?? 'Muqim Admin'}
            </span>
            {session && (
              <button onClick={signOut} title={t('Sign out')} className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100">
                <LogOut size={17} />
              </button>
            )}
            <span className="w-9 h-9 rounded-full bg-teal-700 text-cream-50 grid place-items-center text-sm font-semibold">M</span>
          </div>
        </header>
        <main className="p-4 md:p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
