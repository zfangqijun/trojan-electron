const store = require('./modules/store');
const fs = require('fs/promises')
const toml = require('@iarna/toml')

function exportRouterModeByName(name) {
    const mode = store.getRouterModeByName(name)
    const doc = toml.stringify(mode);
    return doc;
}

function importRouterModeByName(name, text){
    const doc = toml.parse(text);
    console.log(doc)
    store.setRouterModeByName(name, doc);
}

function exportCurrentNode() {
    const node = store.getCurrentNode();
    const doc = toml.stringify(node);
    return doc;
}

function importCurrentNode(text){
    const doc = toml.parse(text);
    console.log(doc)
}

module.exports = {
    exportRouterModeByName,
    importRouterModeByName,
    exportCurrentNode,
    importCurrentNode
}
