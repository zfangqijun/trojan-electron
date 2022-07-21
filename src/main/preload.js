module.exports = function () {
    global.R = require('ramda');
    
    global.crypto = {
        getRandomValues: require('get-random-values')
    }
}