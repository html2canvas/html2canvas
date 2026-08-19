const path = require('path');
const webpack = require('webpack');
const pkg = require('../package.json');

const banner = `/*
 * ${pkg.title} ${pkg.version} <${pkg.homepage}>
 * Copyright (c) ${new Date().getFullYear()} ${pkg.author.name} <${pkg.author.url}>
 * Released under ${pkg.license} License
 */`;

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './tests/testrunner.ts',
    output: {
        path: path.resolve(__dirname, '../build'),
        filename: 'testrunner.js'
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
    plugins: [new webpack.BannerPlugin(banner)]
};
