import fetch from 'node-fetch';
import os from 'os'
import fs from 'fs/promises'
import JSZip from 'jszip'
import path from 'path'


try {
    await downloadLatestTrojanGo();
} catch (e) {
    console.log(`下载失败, 你可以到 https://github.com/p4gefau1t/trojan-go/releases 下载, 将可执行文件解压到 ${path.resolve('./resource/trojan')}`)
}

async function downloadLatestTrojanGo() {
    const binPath = path.resolve('./resource/trojan/trojan-go');

    if (await exists(binPath)) {
        return;
    }

    console.log('正在下载最新Trojan-Go...')

    const latest = await fetch('https://api.github.com/repos/p4gefau1t/trojan-go/releases/latest').then(r => r.json())
    const assetName = `trojan-go-${platform()}-${arch()}.zip`
    const tagName = latest.tag_name;
    console.log(latest)
    const url = `https://github.com/p4gefau1t/trojan-go/releases/download/${tagName}/${assetName}`

    console.log(url)

    const zipBuffer = Buffer.from(await fetch(url, { headers: { 'content-type': 'binary/octet-stream' } }).then((res) => res.arrayBuffer()))
    const jszip = new JSZip()
    const zip = await jszip.loadAsync(zipBuffer)
    const binBuffer = await zip.file('trojan-go').async('nodebuffer')
    await fs.writeFile(binPath, binBuffer, { mode: '777' })
}

function arch() {
    return {
        arm64: 'arm64',
        x64: 'amd64',
    }[os.arch()];
}

function platform() {
    return os.platform()
}

async function exists(path) {
    try {
        await fs.stat(path)
        return true;
    } catch (e) {
        return false;
    }
}