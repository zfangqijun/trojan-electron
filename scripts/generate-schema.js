const fs = require('fs')

const GenerateSchema = require('generate-schema')

const defaultObject = require('../src/common/store-defaults.json')
const object = require('./store-object.json')

const schema = GenerateSchema.json('store', [
    defaultObject, object
]);

const path = require('path')

fs.writeFileSync(
    path.resolve(__dirname, 'schema.json'),
    JSON.stringify(schema.items.properties, null, '  ')
)
