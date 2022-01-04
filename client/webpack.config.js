const path = require('path');
const webpack = require('webpack');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { buildNumber } = require('../core/webpack.config');

module.exports = {
  target: 'web',
  mode: 'development',
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
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsConfigPathsPlugin({ baseUrl: '../' })],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'www', to: './client' }],
    }),
    new HtmlWebpackPlugin({
      title: 'Infinitris 2 Client',
      template: 'src/index.ejs',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ManifestPlugin({
      fileName: 'client/manifest.json',
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(buildNumber),
    }),
  ],
};
