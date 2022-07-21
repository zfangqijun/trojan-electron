const EventEmitter = require('events')

const Events = {
  TrojanLog: 'Trojan.Log',
  StoreChange: 'Store.Change'
}

class Observer extends EventEmitter {
  Events = Events
}

const GlobalObserver = new Observer()

module.exports = GlobalObserver
