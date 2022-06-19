import { defineConfig } from 'vite'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import { builtinModules } from 'module'

export default defineConfig({
    build: {
        lib: {
            entry: './src/main',
            formats: ['cjs'],
            fileName: () => '[name].js',
        },
        outDir: './.dist/src/main',
        rollupOptions: {
            external: [
                'electron',
                'fs/promises',
                ...builtinModules,
            ]
        }
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        copy({
            targets: [
                { src: 'package.json', dest: '.dist' },
                { src: 'resource', dest: '.dist' },
            ]
        })
    ]
})
