const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.title} ${pkg.version}
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author.name} <${pkg.author.url}>
 * Released under ${pkg.license} License
 */`;

const commonConfig = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist/html2canvas'),
        library: {
            name: 'html2canvas',
            type: 'umd',
            umdNamedDefine: true,
            export: 'default'
        },
        globalObject: 'this'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                use: 'json-loader',
                type: 'javascript/auto'
            }
        ]
    },
    plugins: [
        new webpack.BannerPlugin(banner),
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map'
        })
    ]
};

const nonMinifiedConfig = {
    ...commonConfig,
    output: {
        ...commonConfig.output,
        filename: 'html2canvas.js',
        library :{
            ...commonConfig.output.library,
            type: 'commonjs-static',
        }
    },
    optimization: {
        minimize: false,
    }
};

const esmConfig = {
    ...commonConfig,
    output: {
        ...commonConfig.output,
        filename: 'html2canvas.esm.js'
    }
    // ... ES module-specific configurations
};

const minifiedConfig = {
    ...commonConfig,
    output: {
        ...commonConfig.output,
        filename: 'html2canvas.min.js',
        library :{
            ...commonConfig.output.library,
            type: 'commonjs-static',
        }
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: /^!/ // Preserve comments that start with `!`
                    }
                },
                extractComments: false
            })
        ]
    }
};

module.exports = [esmConfig, nonMinifiedConfig, minifiedConfig];
