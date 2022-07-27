const { Server } = require('socket.io')
const { RPC } = require('jsonrpcv2')
const { createServer } = require('http')
const BaseModule = require('../base-module')

class RPCServer extends BaseModule {
  name = 'RPCServer'
  rpcInstances = new Set()

  init = async () => {
    await this.waitModuleReady('Ports')

    const server = createServer()
    const io = new Server(server)

    io.of('/rpc').on('connection', this.handleConnection)

    const port = await this.invoke('Ports.getPort', 'http')

    return new Promise(resolve => {
      server.listen(port, () => {
        this.log('Listening on port', port)
        resolve()
      })
    })
  }

  notifyAllSides = (method, params) => {
    this.rpcInstances.forEach(rpc => rpc.notify(method, params))
  }

  /**
   *
   * @param {import('socket.io').Socket} socket
   */
  handleConnection = (socket) => {
    this.log('新连接:', ...socket.rooms.values())

    this.createRPCInstance(socket)

    socket.join('rpc-room')
  }

  createRPCInstance = async (socket) => {
    const instance = new RPC()

    instance.exposeFromArray(await this.getMethods())

    instance.setTransmitter((message) => {
      socket.send(message)
    })

    socket.on('message', (message) => {
      instance.receive(message)
    })

    socket.on('disconnect', () => {
      this.log('连接断开:', socket.id)
      this.rpcInstances.delete(RPC)
    })

    this.rpcInstances.add(instance)

    instance.notify('ready')
  }

  getMethods = async () => {
    const methods = await this.invoke('RPCMethods.getMethods')

    return methods.map((method) => {
      const methodWrapper = (...args) => {
        this.log('Browser Invoke:', method.name)

        return method.apply(null, args).catch((error) => {
          this.logError('Browser Invoke Error:', method.name, args, error)
          throw { message: error.message } // eslint-disable-line
        })
      }
      return [method.name, methodWrapper]
    })
  }
}

module.exports = new RPCServer()
