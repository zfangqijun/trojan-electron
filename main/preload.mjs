import * as R from 'ramda';
import ElectronLog from 'electron-log'
import getRandomValues from 'get-random-values';

global.R = R

global.crypto = {
  getRandomValues: getRandomValues
}

ElectronLog.transports.file.level = 'info'
ElectronLog.transports.console.level = 'silly'
ElectronLog.transports.file.fileName = 'main.log'

