/**
 * 来自main进程的，electron-store的数据
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DrawerState {
    proxySettings: {
        visible: boolean;
        data?: ProxyNode;
    };
    [key: string]: {
        visible: boolean;
        data?: any;
    };
}

const initialState: DrawerState = {
    proxySettings: {
        visible: false
    },
    router: {
        visible: false
    }
}


const slice = createSlice({
    name: 'drawer',
    initialState,
    reducers: {
        setVisible(state, { payload }: PayloadAction<{ name: string, visible: boolean, data?: any }>) {
            const { visible, data } = payload;
            state[payload.name] = { visible, data }
        }
    }
})

export const { setVisible } = slice.actions;

export default slice;
