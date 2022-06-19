const fs = require('fs')
const R = require('ramda')
const path = require('path')

const files = [
    // 需要打包进Electron的文件
    'package.json',
    '.dist',
    'resource',
    // FIXME
    // mian 本身应该是不需要的，只需要.dist，
    // 但是 ignores 包含 main 后会造成 .dist/main 
    // 'main'
];

const ignores = R.reject(
    name => files.includes(name),
    fs.readdirSync(__dirname)
)

module.exports = {
    "packagerConfig": {
        // 默认打包当前文件夹所有文件，forge禁止了了dir选项覆盖，故通过ignores进行忽略
        // https://www.electronforge.io/configuration#packager-config
        "ignore": [
            ...ignores
        ],
        "extraResource": [],
    },
    "makers": [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "name": "trojan_gui"
            }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [
                "darwin"
            ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        }
    ]
}