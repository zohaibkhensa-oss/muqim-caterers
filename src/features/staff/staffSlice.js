import { createSlice } from '@reduxjs/toolkit'
import { STAFF } from '@/data/mock'

const staffSlice = createSlice({
  name: 'staff',
  initialState: { list: STAFF },
  reducers: {
    hydrate(state, action) {
      state.list = action.payload
    },
  },
})

export const { hydrate } = staffSlice.actions
export default staffSlice.reducer
