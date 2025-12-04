import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const banner = `/*!
 * ${pkg.title} ${pkg.version} <${pkg.homepage || ''}>
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author.name} <${pkg.author.url}>
 * Released under ${pkg.license} License
 */`;

const commonPlugins = [
    nodeResolve({
        preferBuiltins: false
    }),
    commonjs(),
    typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false,
        outDir: undefined,
        declarationDir: undefined
    })
];

export default [
    // UMD build (non-minified)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/html2canvas.js',
            format: 'umd',
            name: 'html2canvas',
            banner,
            sourcemap: true,
            exports: 'default'
        },
        plugins: commonPlugins
    },
    // UMD build (minified)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/html2canvas.min.js',
            format: 'umd',
            name: 'html2canvas',
            banner,
            sourcemap: true,
            exports: 'default'
        },
        plugins: [
            ...commonPlugins,
            terser({
                format: {
                    comments: /^!/
                }
            })
        ]
    },
    // ES Module build (for importmap)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/html2canvas.esm.js',
            format: 'es',
            banner,
            sourcemap: true,
            exports: 'default'
        },
        plugins: commonPlugins
        // Note: css-line-break and text-segmentation are bundled for importmap compatibility
    },
    // ES Module build (minified)
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/html2canvas.esm.min.js',
            format: 'es',
            banner,
            sourcemap: true,
            exports: 'default'
        },
        plugins: [
            ...commonPlugins,
            terser({
                format: {
                    comments: /^!/
                }
            })
        ]
        // Note: css-line-break and text-segmentation are bundled for importmap compatibility
    }
];

