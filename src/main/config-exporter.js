const store = require('./modules/store');
const yaml = require('js-yaml')
const fs = require('fs/promises')

function exportRouterModeByName(name) {
    const mode = store.getRouterModeByName(name)
    const doc = yaml.dump(mode);
    return doc;
}

function importRouterModeByName(name, text){
    const doc = yaml.load(text);
    store.setRouterModeByName(name, doc);
}

module.exports = {
    exportRouterModeByName,
    importRouterModeByName
}
