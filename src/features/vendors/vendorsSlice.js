import { createSlice, nanoid } from '@reduxjs/toolkit'
import { VENDORS } from '@/data/mock'

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState: { list: VENDORS },
  reducers: {
    hydrate(state, action) {
      state.list = action.payload
    },
    addVendor(state, action) {
      state.list.push({ id: `vn-${nanoid(6)}`, balance: 0, items: '', ...action.payload })
    },
    updateVendor(state, action) {
      const v = state.list.find((x) => x.id === action.payload.id)
      if (v) Object.assign(v, action.payload)
    },
    removeVendor(state, action) {
      state.list = state.list.filter((x) => x.id !== action.payload.id)
    },
    adjustBalance(state, action) {
      const v = state.list.find((x) => x.id === action.payload.id)
      if (v) v.balance += action.payload.delta
    },
  },
})

export const { hydrate, addVendor, updateVendor, removeVendor, adjustBalance } = vendorsSlice.actions
export default vendorsSlice.reducer
