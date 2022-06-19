const packager = require('electron-packager')
const zip = require('electron-installer-zip');
const path = require('path')

packager({
    overwrite: true,
    dir: '.dist',
    out: 'out',
    icon: 'resource/static/icon.icns',
}).then((result) => {
    console.log('package out: ', result)
    const dir = path.resolve(__dirname, ...result, 'trojan-gui.app')
    const out = path.resolve(__dirname, 'out', 'trojan-gui.zip')

    zip({ dir, out }, (err, res) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('Zip file written to: ', out);
    })

}).catch(error => {
    throw error;
})
