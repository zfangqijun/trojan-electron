import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy'
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/main/main.mjs',
    output: [
        {
            file: '.dist/src/main/index.mjs',
            format: 'es',
        },
        {
            file: '.dist/src/main/index.js',
            format: 'cjs',
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