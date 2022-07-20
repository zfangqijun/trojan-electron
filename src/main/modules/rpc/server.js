const { forEachObjIndexed } = require('ramda');
const { Server } = require('socket.io');
const { RPC } = require('jsonrpcv2');
const { createServer } = require('http')

const methods = require('./methods');
const Elog = require('../../elog')('JSON RPC');
const GlobalObserver = require('../../observer/observer');
const ports = require('../../ports');
const BaseModule = require('../../base-module');

class RPCServer extends BaseModule {
    name = 'RPCServer';

    init = async () => {
        this.emit('log', 'Initializing RPC server');

        const server = createServer();
        const io = new Server(server);

        io.on('connection', (socket) => {
            this.emit('log', 'Client connected', socket.id);

            const rpc = new RPC();

            socket.on('message', (message) => {
                rpc.receive(message)
            })

            rpc.setTransmitter((message) => {
                socket.send(message)
            })

            forEachObjIndexed((method, methodName) => {
                rpc.expose(methodName, function (...args) {
                    this.emit('log', 'Invoking method', methodName, ...args);
                    return method.call(null, ...args).catch((error) => {
                        this.emit('log/error', 'Error invoking method', methodName, ...args, error);
                        throw { message: error.message }
                    })
                });
            }, methods)

            rpc.notify('ready');

            GlobalObserver.on(GlobalObserver.Events.StoreChange, notifyStoreChange)

            socket.on('disconnect', () => {
                this.emit('log', 'Client disconnected', socket.id);
                GlobalObserver.removeListener(GlobalObserver.Events.StoreChange, notifyStoreChange);

                forEachObjIndexed((_, methodName) => {
                    rpc.unexpose(methodName)
                }, methods);
            })

            function notifyStoreChange(newValue) {
                rpc.notify(GlobalObserver.Events.StoreChange, newValue)
            }
        });


        const port = await this.invoke('Ports', 'getPort', 'http');

        return new Promise(resolve => {
            server.listen(port, () => {
                this.emit('log', 'RPC server listening on port', port);
                resolve();
            })
        })
    }
}

module.exports = new RPCServer();