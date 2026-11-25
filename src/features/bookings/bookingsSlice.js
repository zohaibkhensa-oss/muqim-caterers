import { createSlice, nanoid } from '@reduxjs/toolkit'
import { BOOKINGS } from '@/data/mock'

const nextRef = (list) => {
  const max = list.reduce((m, b) => Math.max(m, parseInt(b.ref.split('-')[1], 10) || 0), 2400)
  return `MQ-${max + 1}`
}

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: { list: BOOKINGS },
  reducers: {
    hydrate(state, action) {
      state.list = action.payload
    },
    addBooking: {
      reducer(state, action) {
        state.list.unshift(action.payload)
      },
      prepare(booking, list) {
        return {
          payload: {
            id: `bk-${nanoid(8)}`,
            ref: nextRef(list),
            status: 'inquiry',
            createdAt: new Date().toISOString(),
            statusHistory: [{ status: 'inquiry', at: new Date().toISOString() }],
            notes: [],
            staffIds: [],
            cateringType: 'full',
            pax: { veg: 0, nonVeg: 0 },
            receipts: [],
            expenses: [],
            menuItems: [],
            logistics: [],
            procurement: null,
            ...booking,
          },
        }
      },
    },
    moveBooking(state, action) {
      const { id, status } = action.payload
      const b = state.list.find((x) => x.id === id)
      if (!b || b.status === status) return
      b.status = status
      b.statusHistory.push({ status, at: new Date().toISOString() })
    },
    addNote(state, action) {
      const b = state.list.find((x) => x.id === action.payload.id)
      if (b) b.notes.push(action.payload.note)
    },
    addMenuItem(state, action) {
      const { id, dish, group } = action.payload
      const b = state.list.find((x) => x.id === id)
      if (!b) return
      b.menuItems = b.menuItems ?? []
      if (!b.menuItems.some((m) => m.dish === dish)) b.menuItems.push({ dish, group })
    },
    removeMenuItem(state, action) {
      const b = state.list.find((x) => x.id === action.payload.id)
      if (b?.menuItems) b.menuItems = b.menuItems.filter((m) => m.dish !== action.payload.dish)
    },
    setMenuItemGroup(state, action) {
      const { id, dish, group } = action.payload
      const m = state.list.find((x) => x.id === id)?.menuItems?.find((m) => m.dish === dish)
      if (m) m.group = group
    },
    setProcurement(state, action) {
      const b = state.list.find((x) => x.id === action.payload.id)
      if (b) b.procurement = action.payload.groups
    },
    setProcurementVendor(state, action) {
      const g = state.list.find((x) => x.id === action.payload.id)?.procurement?.find((g) => g.id === action.payload.groupId)
      if (g) g.vendorId = action.payload.vendorId
    },
    setProcurementStatus(state, action) {
      const g = state.list.find((x) => x.id === action.payload.id)?.procurement?.find((g) => g.id === action.payload.groupId)
      if (g) g.status = action.payload.status
    },
    toggleLogisticItem(state, action) {
      const b = state.list.find((x) => x.id === action.payload.id)
      if (!b) return
      b.logistics = b.logistics ?? []
      const key = action.payload.key
      b.logistics = b.logistics.includes(key)
        ? b.logistics.filter((k) => k !== key)
        : [...b.logistics, key]
    },
    addReceipt(state, action) {
      const b = state.list.find((x) => x.id === action.payload.id)
      if (b) b.receipts.push({ ...action.payload.receipt, at: new Date().toISOString() })
    },
    addExpense(state, action) {
      const b = state.list.find((x) => x.id === action.payload.id)
      if (b) b.expenses.push({ ...action.payload.expense, at: new Date().toISOString() })
    },
    assignStaff(state, action) {
      const { id, staffId } = action.payload
      const b = state.list.find((x) => x.id === id)
      if (!b) return
      b.staffIds = b.staffIds.includes(staffId)
        ? b.staffIds.filter((s) => s !== staffId)
        : [...b.staffIds, staffId]
    },
  },
})

export const {
  hydrate,
  addBooking, moveBooking, addNote, assignStaff, addReceipt, addExpense,
  addMenuItem, removeMenuItem, setMenuItemGroup,
  setProcurement, setProcurementVendor, setProcurementStatus, toggleLogisticItem,
} = bookingsSlice.actions
export const selectBookingByRef = (state, ref) => state.bookings.list.find((b) => b.ref === ref)
export const selectBookingById = (state, id) => state.bookings.list.find((b) => b.id === id)
export default bookingsSlice.reducer
