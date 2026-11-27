import { supabaseReady } from '@/lib/supabase'
import { saveBooking, saveVendor, deleteVendor } from '@/lib/db'

// Write-through: after any bookings/* or vendors/* mutation, upsert the touched row.
export const syncMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  if (!supabaseReady) return result

  if (action.type?.startsWith('bookings/') && action.type !== 'bookings/hydrate') {
    const id = action.payload?.id
    const booking = id && store.getState().bookings.list.find((b) => b.id === id)
    if (booking) saveBooking(booking)
  }

  if (action.type === 'vendors/removeVendor') {
    deleteVendor(action.payload.id)
  } else if (action.type?.startsWith('vendors/') && action.type !== 'vendors/hydrate') {
    // addVendor/updateVendor/adjustBalance — the reducer already ran, persist the row.
    const { list } = store.getState().vendors
    const id = action.payload?.id
    const vendor = id
      ? list.find((v) => v.id === id)
      : // addVendor generates the id inside the reducer — match by the payload fields.
        [...list].reverse().find((v) => v.name === action.payload?.name && v.phone === action.payload?.phone)
    if (vendor) saveVendor(vendor)
  }

  return result
}
