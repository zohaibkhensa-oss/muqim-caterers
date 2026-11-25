import { supabaseReady } from '@/lib/supabase'
import { saveBooking } from '@/lib/db'

// Write-through: after any bookings/* mutation, upsert the touched booking.
export const syncMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  if (!supabaseReady) return result
  if (action.type?.startsWith('bookings/') && action.type !== 'bookings/hydrate') {
    const id = action.payload?.id
    const booking = id && store.getState().bookings.list.find((b) => b.id === id)
    if (booking) saveBooking(booking)
  }
  return result
}
