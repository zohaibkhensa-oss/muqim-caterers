import { configureStore } from '@reduxjs/toolkit'
import bookingsReducer from '@/features/bookings/bookingsSlice'
import packagesReducer from '@/features/packages/packagesSlice'
import clientsReducer from '@/features/clients/clientsSlice'
import staffReducer from '@/features/staff/staffSlice'
import vendorsReducer from '@/features/vendors/vendorsSlice'
import { syncMiddleware } from '@/lib/sync'

export const store = configureStore({
  reducer: {
    bookings: bookingsReducer,
    packages: packagesReducer,
    clients: clientsReducer,
    staff: staffReducer,
    vendors: vendorsReducer,
  },
  middleware: (getDefault) => getDefault().concat(syncMiddleware),
})

// Swap mock data for live rows once Supabase responds — no-op without env.
export async function hydrateStore() {
  const { loadAll } = await import('@/lib/db')
  const data = await loadAll()
  if (!data) return
  store.dispatch({ type: 'packages/hydrate', payload: data.packages })
  store.dispatch({ type: 'vendors/hydrate', payload: data.vendors })
  store.dispatch({ type: 'staff/hydrate', payload: data.staff })
  store.dispatch({ type: 'clients/hydrate', payload: data.clients })
  store.dispatch({ type: 'bookings/hydrate', payload: data.bookings })
}

