const ElectronLog = require('electron-log');
const EventEmitter = require('events');

class Log extends EventEmitter {
    name = 'Log';


}

module.exports = Log;