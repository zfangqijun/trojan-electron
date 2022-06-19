import { RPC } from 'jsonrpcv2'
import io from 'socket.io-client'
import { setElectronStoreState } from '../redux/electron-store'
import { useDispatch } from 'react-redux'

const url = 'ws://127.0.0.1:3188';
const rpc = new RPC();
const socket = io(url, {
    transports: ['websocket'],
    autoConnect: false
})

var isInit = false;

function invoke(methodName: string, ...args: any[]) {
    return rpc.invoke(methodName, args).catch((result) => {
        throw new Error(result?.data?.error?.message)
    })
}


export function useRPC() {
    const dispatch = useDispatch();

    if (socket.connected === false) {
        socket.connect();
    };

    if (isInit) return { rpc, invoke };


    rpc.onNotification('ready', async () => {
        const storeData: any = await rpc.invoke('getStoreData');
        console.log('getStoreData', storeData)
        dispatch(setElectronStoreState(storeData))
    })

    rpc.onNotification('Store.Change', (newState) => {
        console.log('Store.Change', newState)
        dispatch(setElectronStoreState(newState))
    })

    socket.on('message', (message) => {
        rpc.receive(message)
    })

    rpc.setTransmitter(async (message) => {
        socket.send(message)
    })

    socket.on('connect', () => {
        console.log('connect')
    })

    socket.on('disconnect', () => {
        console.log('disconnect')
    })

    socket.on('connect_error', (error) => {
        console.log('disconnect', error)
    })

    isInit = true;

    return { rpc, invoke };
}

