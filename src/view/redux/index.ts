import { configureStore } from '@reduxjs/toolkit';

import electronStoreSlice from './electron-store'
import drawerSlice from './drawer';

export const store = configureStore({
    reducer: {
        [electronStoreSlice.name]: electronStoreSlice.reducer,
        [drawerSlice.name]: drawerSlice.reducer
    },
})

export type StoreState = ReturnType<typeof store.getState> 
