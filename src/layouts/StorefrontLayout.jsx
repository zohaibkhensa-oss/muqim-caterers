import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu as MenuIcon, X } from 'lucide-react'
import { useState } from 'react'
import { CONTACT } from '@/data/mock'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/packages', label: 'Packages' },
  { to: '/menu', label: 'Full Menu' },
  { to: '/booking', label: 'Track Booking' },
]

export default function StorefrontLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-teal-800">
            <img src="/logo.jpeg" alt="Muqim Caterer's" className="h-11 w-auto rounded-lg bg-white object-contain" />
            <span className="font-display text-xl font-semibold tracking-tight hidden sm:block">Muqim Caterers</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  isActive ? 'text-teal-700' : 'text-stone-500 hover:text-teal-700'
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/book"
              className="rounded-full bg-teal-700 text-cream-50 px-5 py-2 hover:bg-teal-600 transition-colors"
            >
              Book Now
            </Link>
          </nav>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden border-t border-cream-200 px-4 py-3 flex flex-col gap-3 text-sm font-medium bg-cream-50">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className="text-stone-600">
                {l.label}
              </NavLink>
            ))}
            <Link to="/book" onClick={() => setOpen(false)} className="text-teal-700 font-semibold">
              Book Now →
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-teal-950 text-cream-200">
        <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5 text-cream-50 mb-3">
              <img src="/logo.jpeg" alt="Muqim Caterer's" className="h-10 w-auto rounded-md bg-white object-contain" />
              <span className="font-display text-lg font-semibold">Muqim Caterers</span>
            </div>
            <p className="text-sm text-cream-300/80 max-w-xs">
              Semi catering, full catering, events and theme parties — authentic Lucknowi food, served with pride.
            </p>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold text-cream-50 mb-3">Contact</h4>
            <p className="text-cream-300/80">{CONTACT.phones[0]}</p>
            <p className="text-cream-300/80">{CONTACT.phones[1]}</p>
            <p className="text-cream-300/80">{CONTACT.address}</p>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold text-cream-50 mb-3">Quick links</h4>
            <div className="flex flex-col gap-2 text-cream-300/80">
              <Link to="/packages" className="hover:text-cream-50">Menus & Packages</Link>
              <Link to="/book" className="hover:text-cream-50">Book an event</Link>
              <Link to="/admin" className="hover:text-cream-50">Staff login</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-teal-800 py-4 text-center text-xs text-cream-300/60">
          © {new Date().getFullYear()} Muqim Caterers
        </div>
      </footer>
    </div>
  )
}
