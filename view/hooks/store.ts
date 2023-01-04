import { useSelector } from 'react-redux'
import { StoreState } from '../redux';
import electronStoreSlice from '../redux/electron-store'
import drawerSlice from '../redux/drawer'

export function useElectronStore() {
    return useSelector((state: StoreState) => state[electronStoreSlice.name]);
}

export function useDrawer() {
    return useSelector((state: StoreState) => state[drawerSlice.name]);
}
