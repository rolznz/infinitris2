const path = require('path');
const webpack = require('webpack');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    target: 'web',
    mode: "development",
    devtool: 'source-map',
    entry: [
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle[hash].js',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['awesome-typescript-loader'],
            },
            {
                test:/\.css$/,
                use:['style-loader','css-loader']
            }
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        plugins: [new TsConfigPathsPlugin({ baseUrl: "../" })],
    },
    plugins: [
        new CopyPlugin([
            { from: 'www', to: './' },
        ]),
        new HtmlWebpackPlugin({
            title: "Infinitris 2",
            template: "src/Index.ejs",
        }),
    ]
};