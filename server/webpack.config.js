const path = require('path');
const webpack = require('webpack');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { buildNumber } = require('../core/webpack.config');

module.exports = {
  target: 'node',
  mode: 'development',
  devtool: 'source-map',
  entry: ['./src/Server'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsConfigPathsPlugin({ baseUrl: '../' })],
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(buildNumber),
    }),
  ],
};
