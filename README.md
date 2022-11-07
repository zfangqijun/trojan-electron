# Trojan-Electron [![CodeQL](https://github.com/zfangqijun/trojan-electron/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/zfangqijun/trojan-electron/actions/workflows/codeql-analysis.yml)

> **注意:** 使用本软件时，请遵守中国法律、法规

基于 [**Electron**](https://github.com/electron/electron) 开发的 [**Trojan Go**](https://github.com/p4gefau1t/trojan-go) 跨平台GUI客户端

**该应用正在开发中，所有的功能均为不稳定状态，均可能出现较大改动**

![Image Text](https://github.com/zfangqijun/github-assets/raw/main/trojan-electron/main-page.png)

## 简介

## Releases

## 开发

### 安装依赖

> 安装依赖过程中若trojan-go下载失败, 可自行到 [Trojan-Go Releases](https://github.com/p4gefau1t/trojan-go/releases) 下载最新的可执行文件, 将可执行文件trojan-go放到 /resource/trojan 目录下

```bash
pnpm i
```

### 开发

```bash
pnpm main:dev
pnpm view:dev
```

### 打包

```
pnpm packager
```

## 跨平台支持

目前仅支持了macOS

## 致谢
- [Trojan-Go](https://github.com/p4gefau1t/trojan-go)

