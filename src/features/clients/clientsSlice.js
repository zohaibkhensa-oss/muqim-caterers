import { createSlice } from '@reduxjs/toolkit'
import { CLIENTS } from '@/data/mock'

const clientsSlice = createSlice({
  name: 'clients',
  initialState: { list: CLIENTS },
  reducers: {
    hydrate(state, action) {
      state.list = action.payload
    },
  },
})

export const { hydrate } = clientsSlice.actions
export default clientsSlice.reducer
