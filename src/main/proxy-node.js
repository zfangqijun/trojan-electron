/// <reference path="../../common/types/trojan-config.d.ts" />

const uuid = require('uuid')

/**
 *
 * @param {{type:'trojan', name:string, config:TrojanConfig}} options
 * @returns
 */
function createProxyNode (options) {
  const {
    type,
    name,
    config
  } = options

  return {
    uuid: uuid.v4(),
    type: type || 'trojan',
    name: name || '新节点',
    config: config || null
  }
}

module.exports = { createProxyNode }
