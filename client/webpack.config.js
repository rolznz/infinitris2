const path = require('path');
const webpack = require('webpack');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
    target: 'web',
    mode: "development",
    devtool: 'source-map',
    entry: [
        './src/index',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:8080/',
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'client/bundle.[hash].js',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: ['awesome-typescript-loader'],
            },
            {
                test: /\.ts$/,
                exclude: [ path.resolve(__dirname, "spec") ],
                enforce: 'post',
                use: {
                  loader: 'istanbul-instrumenter-loader',
                  options: { esModules: true }
                }
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
        new CopyPlugin({
          patterns: [{ from: 'www', to: './client' }],
        }),
        new HtmlWebpackPlugin({
            title: "Infinitris 2 Client",
            template: "src/index.ejs",
        }),
        new webpack.HotModuleReplacementPlugin(),
        new ManifestPlugin(),
    ]
};