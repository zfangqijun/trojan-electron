import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy'
import terser from '@rollup/plugin-terser';

export default {
    input: 'main/main.mjs',
    output: [
        {
            file: '.dist/main/index.mjs',
            format: 'es',
        },
        {
            file: '.dist/main/index.js',
            format: 'cjs',
            plugins: [terser()]
        }
    ],
    external: [
        'electron'
    ],
    plugins: [
        nodeResolve(),
        commonjs({
            sourceMap: false,
            transformMixedEsModules: true
        }),
        json(),
        copy({
            targets: [
                { src: 'package.json', dest: '.dist' },
                { src: 'resource', dest: '.dist' },
            ]
        })
    ]
}