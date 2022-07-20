const { forEachObjIndexed } = require('ramda');
const { Server } = require('socket.io');
const { RPC } = require('jsonrpcv2');
const { createServer } = require('http')

const methods = require('./rpc-methods');
const Elog = require('../elog')('JSON RPC');
const GlobalObserver = require('../observer/observer');
const BaseModule = require('../base-module');

class RPCServer extends BaseModule {
    name = 'RPCServer';

    init = async () => {
        this.log('init');

        const server = createServer();
        const io = new Server(server);

        io.on('connection', this.handleConnection);

        const port = await this.invoke('Ports.getPort', 'http');

        return new Promise(resolve => {
            server.listen(port, () => {
                this.log('RPC server listening on port', port);
                resolve();
            })
        })
    }

    /**
     * 
     * @param {import('socket.io').Socket} socket 
     */
    handleConnection = (socket) => {
        this.log('Client connected', socket.id);

        const rpc = new RPC();
        rpc.setTransmitter(socket.send.bind(socket))
        socket.on('message', rpc.receive.bind(rpc))

        forEachObjIndexed((method, methodName) => {
            rpc.expose(methodName, (...args) => {
                // return this.invoke(methodName, ...args);
                // this.log('Invoking method', methodName);
                return method.call(null, ...args).catch((error) => {
                    this.log.error('Error invoking method', methodName, args, error);
                    throw { message: error.message }
                })
            });
        }, methods)

        rpc.notify('ready');

        // todo 移动到methods中实现
        // GlobalObserver.on(GlobalObserver.Events.StoreChange, notifyStoreChange)

        socket.on('disconnect', () => {
            this.log('Client disconnected', socket.id);
            // GlobalObserver.removeListener(GlobalObserver.Events.StoreChange, notifyStoreChange);

            forEachObjIndexed((_, methodName) => {
                rpc.unexpose(methodName)
            }, methods);
        })

        // function notifyStoreChange(newValue) {
        //     rpc.notify(GlobalObserver.Events.StoreChange, newValue)
        // }
    }
}

module.exports = new RPCServer();