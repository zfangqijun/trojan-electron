const { Server } = require('socket.io')
const { RPC } = require('jsonrpcv2')
const { createServer } = require('http')
const BaseModule = require('../base-module')

class RPCServer extends BaseModule {
  name = 'RPCServer'

  init = async () => {
    this.log('init')

    const server = createServer()
    const io = new Server(server)

    io.on('connection', this.handleConnection)

    const port = await this.invoke('Ports.getPort', 'http')

    return new Promise(resolve => {
      server.listen(port, () => {
        this.log('RPC server listening on port', port)
        resolve()
      })
    })
  }

  /**
     *
     * @param {import('socket.io').Socket} socket
     */
  handleConnection = async (socket) => {
    this.log('Client connected', socket.id)

    const rpc = new RPC()
    rpc.setTransmitter(socket.send.bind(socket))
    socket.on('message', rpc.receive.bind(rpc))

    const methods = await this.invoke('RPCMethods.getMethods')

    methods
      .map((method) => {
        const methodWrapper = (...args) => {
          this.log('Browser Invoke:', method.name)

          return method.apply(null, args).catch((error) => {
            this.log.error('Browser Invoke Error:', method.name, args, error)
            throw { message: error.message } // eslint-disable-line
          })
        }
        return [method.name, methodWrapper]
      })
      .forEach(([name, method]) => {
        rpc.expose(name, method)
      })

    rpc.notify('ready')

    // todo 移动到methods中实现
    // GlobalObserver.on(GlobalObserver.Events.StoreChange, notifyStoreChange)

    socket.on('disconnect', () => {
      this.log('Client disconnected', socket.id)
      // GlobalObserver.removeListener(GlobalObserver.Events.StoreChange, notifyStoreChange);
      methods.forEach(method => {
        rpc.unexpose(method.name)
      })
    })

    // function notifyStoreChange(newValue) {
    //     rpc.notify(GlobalObserver.Events.StoreChange, newValue)
    // }
  }
}

module.exports = new RPCServer()
