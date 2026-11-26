import { createSlice, nanoid } from '@reduxjs/toolkit'
import { BOOKINGS } from '@/data/mock'
import { spawnTasks } from '@/lib/tasks'

const nextRef = (list) => {
  const max = list.reduce((m, b) => Math.max(m, parseInt(b.ref.split('-')[1], 10) || 0), 2400)
  return `MQ-${max + 1}`
}

const find = (state, id) => state.list.find((x) => x.id === id)

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
        const now = new Date().toISOString()
        // duplicate lead flag: same phone + same event day
        const day = booking.date?.slice(0, 10)
        const dup = list.find((b) => b.client?.phone === booking.client?.phone && b.date?.slice(0, 10) === day)
        return {
          payload: {
            id: `bk-${nanoid(8)}`,
            ref: nextRef(list),
            status: 'inquiry',
            createdAt: now,
            statusHistory: [{ status: 'inquiry', at: now }],
            notes: [],
            staffIds: [],
            cateringType: 'full',
            pax: { veg: 0, nonVeg: 0 },
            receipts: [],
            expenses: [],
            menuItems: [],
            logistics: [],
            procurement: null,
            tasks: [],
            leadStatus: 'new',
            source: 'Website / QR',
            menuVersions: [],
            menuApproved: false,
            quoteVersions: [],
            estimate: {},
            closing: null,
            possibleDuplicate: Boolean(dup),
            duplicateOf: dup?.ref ?? null,
            ...booking,
          },
        }
      },
    },
    moveBooking(state, action) {
      const { id, status } = action.payload
      const b = find(state, id)
      if (!b || b.status === status) return
      b.status = status
      b.statusHistory.push({ status, at: new Date().toISOString() })
      // task engine: spawn templated tasks for the new status (dedupe by tpl)
      b.tasks = [...(b.tasks ?? []), ...spawnTasks(status, b)]
      // confirmed lead leaves the lead pipeline
      if (status === 'confirmed' && b.leadStatus) delete b.leadStatus
    },
    updateBooking(state, action) {
      const { id, patch } = action.payload
      const b = find(state, id)
      if (b) Object.assign(b, patch)
    },
    addNote(state, action) {
      const b = find(state, action.payload.id)
      if (b) b.notes.push(action.payload.note)
    },
    addMenuItem(state, action) {
      const { id, dish, group } = action.payload
      const b = find(state, id)
      if (!b) return
      b.menuItems = b.menuItems ?? []
      if (!b.menuItems.some((m) => m.dish === dish)) {
        b.menuItems.push({ dish, group })
        b.menuApproved = false // changed after approval → needs re-approval
      }
    },
    removeMenuItem(state, action) {
      const b = find(state, action.payload.id)
      if (b?.menuItems) {
        b.menuItems = b.menuItems.filter((m) => m.dish !== action.payload.dish)
        b.menuApproved = false
      }
    },
    setMenuItemGroup(state, action) {
      const { id, dish, group } = action.payload
      const m = find(state, id)?.menuItems?.find((m) => m.dish === dish)
      if (m) m.group = group
    },
    approveMenu(state, action) {
      const b = find(state, action.payload.id)
      if (!b) return
      b.menuVersions = [...(b.menuVersions ?? []), { v: (b.menuVersions?.length ?? 0) + 1, at: new Date().toISOString(), items: b.menuItems.map((m) => ({ ...m })) }]
      b.menuApproved = true
    },
    setQuote(state, action) {
      const { id, amount, terms } = action.payload
      const b = find(state, id)
      if (!b) return
      const v = (b.quoteVersions?.length ?? 0) + 1
      b.quoteVersions = [...(b.quoteVersions ?? []), { v, amount, terms: terms ?? null, at: new Date().toISOString() }]
      b.amount = amount
    },
    setProcurement(state, action) {
      const b = find(state, action.payload.id)
      if (b) b.procurement = action.payload.groups
    },
    setProcurementVendor(state, action) {
      const g = find(state, action.payload.id)?.procurement?.find((g) => g.id === action.payload.groupId)
      if (g) g.vendorId = action.payload.vendorId
    },
    setProcurementStatus(state, action) {
      const g = find(state, action.payload.id)?.procurement?.find((g) => g.id === action.payload.groupId)
      if (g) g.status = action.payload.status
    },
    toggleLogisticItem(state, action) {
      const b = find(state, action.payload.id)
      if (!b) return
      b.logistics = b.logistics ?? []
      const key = action.payload.key
      b.logistics = b.logistics.includes(key)
        ? b.logistics.filter((k) => k !== key)
        : [...b.logistics, key]
    },
    addReceipt(state, action) {
      const b = find(state, action.payload.id)
      if (b) b.receipts.push({ ...action.payload.receipt, at: new Date().toISOString() })
    },
    addExpense(state, action) {
      const b = find(state, action.payload.id)
      if (b) b.expenses.push({ ...action.payload.expense, at: new Date().toISOString() })
    },
    assignStaff(state, action) {
      const { id, staffId } = action.payload
      const b = find(state, id)
      if (!b) return
      b.staffIds = b.staffIds.includes(staffId)
        ? b.staffIds.filter((s) => s !== staffId)
        : [...b.staffIds, staffId]
    },
    // ─── tasks ───
    setTaskStatus(state, action) {
      const { id, taskId, status } = action.payload
      const t = find(state, id)?.tasks?.find((t) => t.id === taskId)
      if (!t) return
      t.status = status
      if (status === 'done') t.doneAt = new Date().toISOString()
    },
    assignTask(state, action) {
      const { id, taskId, staffId } = action.payload
      const t = find(state, id)?.tasks?.find((t) => t.id === taskId)
      if (t) t.assignee = staffId
    },
    addTask(state, action) {
      const b = find(state, action.payload.id)
      if (!b) return
      b.tasks = [...(b.tasks ?? []), { id: `custom-${nanoid(6)}`, status: 'open', createdAt: new Date().toISOString(), ...action.payload.task }]
    },
    // ─── estimate (expected cost, distinct from actual expense) ───
    setEstimate(state, action) {
      const { id, category, amount } = action.payload
      const b = find(state, id)
      if (!b) return
      b.estimate = { ...(b.estimate ?? {}), [category]: amount }
    },
    // ─── next-day closing checklist ───
    toggleClosing(state, action) {
      const b = find(state, action.payload.id)
      if (!b) return
      b.closing = b.closing ?? {}
      const k = action.payload.key
      b.closing[k] = !b.closing[k]
      if (k === 'closed' && b.closing.closed) b.closing.closedAt = new Date().toISOString()
    },
  },
})

export const {
  hydrate,
  addBooking, moveBooking, updateBooking, addNote, assignStaff, addReceipt, addExpense,
  addMenuItem, removeMenuItem, setMenuItemGroup, approveMenu, setQuote,
  setProcurement, setProcurementVendor, setProcurementStatus, toggleLogisticItem,
  setTaskStatus, assignTask, addTask, setEstimate, toggleClosing,
} = bookingsSlice.actions
export const selectBookingByRef = (state, ref) => state.bookings.list.find((b) => b.ref === ref)
export const selectBookingById = (state, id) => state.bookings.list.find((b) => b.id === id)
export default bookingsSlice.reducer
