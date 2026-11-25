import { supabase, supabaseReady } from '@/lib/supabase'

// Row → app shape
const toBooking = (r) => ({
  id: r.id,
  ref: r.ref,
  status: r.status,
  client: r.customer,
  eventType: r.event_type,
  cateringType: r.catering_type,
  date: r.event_date,
  guests: r.guests,
  pax: r.pax ?? { veg: 0, nonVeg: 0 },
  venue: r.venue,
  packageId: r.package_id,
  amount: r.amount,
  notes: r.notes ?? [],
  staffIds: r.staff_ids ?? [],
  statusHistory: r.status_history ?? [],
  receipts: r.receipts ?? [],
  expenses: r.expenses ?? [],
  menuItems: r.menu_items ?? [],
  logistics: r.logistics ?? [],
  procurement: r.procurement ?? null,
  createdAt: r.created_at,
})

const toPackage = (r) => ({
  id: r.id,
  name: r.name,
  badge: r.badge,
  tier: r.tier,
  tagline: r.tagline,
  category: r.category,
  pricePerHead: r.price_per_head,
  minGuests: r.min_guests,
  servesNote: r.serves_note,
  gradient: r.gradient,
  tags: r.tags ?? [],
  items: r.items ?? [],
  active: r.active,
})

const fromBooking = (b) => ({
  id: b.id,
  ref: b.ref,
  status: b.status,
  customer: b.client,
  event_type: b.eventType,
  catering_type: b.cateringType,
  event_date: b.date,
  guests: b.guests,
  pax: b.pax,
  venue: b.venue,
  package_id: b.packageId,
  amount: b.amount,
  notes: b.notes,
  staff_ids: b.staffIds,
  status_history: b.statusHistory,
  receipts: b.receipts,
  expenses: b.expenses,
  menu_items: b.menuItems,
  logistics: b.logistics,
  procurement: b.procurement,
  created_at: b.createdAt,
})

export async function loadAll() {
  if (!supabaseReady) return null
  const [packages, vendors, staff, clients, bookings] = await Promise.all([
    supabase.from('packages').select('*').order('tier'),
    supabase.from('vendors').select('*'),
    supabase.from('staff').select('*'),
    supabase.from('customers').select('*').order('created_at', { ascending: false }),
    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
  ])
  const err = [packages, vendors, staff, clients, bookings].find((r) => r.error)?.error
  if (err) {
    console.error('Supabase load failed:', err.message)
    return null
  }
  return {
    packages: packages.data.map(toPackage),
    vendors: vendors.data,
    staff: staff.data,
    clients: clients.data.map((c) => ({ id: c.id, name: c.name, phone: c.phone, email: c.email, since: c.created_at })),
    bookings: bookings.data.map(toBooking),
  }
}

export async function saveBooking(booking) {
  if (!supabaseReady) return
  const { error } = await supabase.from('bookings').upsert(fromBooking(booking))
  if (error) console.error('Supabase booking save failed:', error.message)
}

// Public status check — works without auth via the RPC.
export async function lookupBookingByRef(ref) {
  if (!supabaseReady) return null
  const { data, error } = await supabase.rpc('booking_status_by_ref', { p_ref: ref })
  if (error || !data?.length) return null
  const r = data[0]
  return {
    ref: r.ref, status: r.status, eventType: r.event_type, date: r.event_date,
    guests: r.guests, venue: r.venue, amount: r.amount, packageId: r.package_id, pax: r.pax,
  }
}

export const auth = {
  session: () => supabaseReady ? supabase.auth.getSession().then((r) => r.data.session) : null,
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  onChange: (cb) => supabaseReady ? supabase.auth.onAuthStateChange(cb) : { data: { subscription: { unsubscribe() {} } } },
}
