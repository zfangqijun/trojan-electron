/**
 * 来自main进程的，electron-store的数据
 */
/// <reference path="../../common/types/electron-store.d.ts"/>
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import defaults from '../../common/store-defaults.json'

const slice = createSlice({
    name: 'electron-store',
    initialState: defaults as ElectronStoreState,
    reducers: {
        setElectronStoreState(state, action: PayloadAction<ElectronStoreState>) {
            return action.payload;
        },
    }
})

export const { setElectronStoreState } = slice.actions;

export default slice