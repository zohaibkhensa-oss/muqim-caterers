import { createSlice, nanoid } from '@reduxjs/toolkit'
import { PACKAGES } from '@/data/mock'

const packagesSlice = createSlice({
  name: 'packages',
  initialState: { list: PACKAGES.map((p) => ({ ...p, active: true })) },
  reducers: {
    hydrate(state, action) {
      state.list = action.payload
    },
    toggleActive(state, action) {
      const p = state.list.find((x) => x.id === action.payload)
      if (p) p.active = !p.active
    },
    addPackage(state, action) {
      state.list.push({ id: `pkg-${nanoid(6)}`, active: true, tags: [], items: [], ...action.payload })
    },
  },
})

export const { hydrate, toggleActive, addPackage } = packagesSlice.actions
export default packagesSlice.reducer
