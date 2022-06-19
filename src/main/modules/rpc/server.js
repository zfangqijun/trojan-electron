const { forEachObjIndexed } = require('ramda');
const { Server } = require('socket.io');
const { RPC } = require('jsonrpcv2');
const { createServer } = require('http')

const methods = require('./methods');
const Elog = require('../elog')('JSON RPC');
const GlobalObserver = require('../../observer/observer');
const { getPort } = require('../../ports');


async function start() {
    const server = createServer();

    const ioServer = new Server(server);

    ioServer.on('connection', (socket) => {
        Elog.log('connection', socket.id)

        const rpc = new RPC();

        socket.on('message', (message) => {
            rpc.receive(message)
        })

        rpc.setTransmitter((message) => {
            socket.send(message)
        })

        forEachObjIndexed((method, methodName) => {
            rpc.expose(methodName, function (...args) {
                // Elog.info(methodName, args);
                return method.call(null, ...args).catch((error) => {
                    Elog.error(methodName, error)
                    throw { message: error.message }
                })
            });
        }, methods)

        rpc.notify('ready');

        GlobalObserver.on(GlobalObserver.Events.StoreChange, notifyStoreChange)

        socket.on('disconnect', () => {
            Elog.log('disconnect', socket.id);

            GlobalObserver.removeListener(GlobalObserver.Events.StoreChange, notifyStoreChange);

            forEachObjIndexed((_, methodName) => {
                rpc.unexpose(methodName)
            }, methods);
        })

        function notifyStoreChange(newValue) {
            rpc.notify(GlobalObserver.Events.StoreChange, newValue)
        }
    })

    return new Promise(resolve => {
        const port = getPort('http');

        server.listen(port, () => {
            Elog.info('listen:', port)
            resolve();
        })
    })


}

module.exports = { start }