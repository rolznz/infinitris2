const path = require('path');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

module.exports = {
  target: "node",
  mode: "development",
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
        use: ['awesome-typescript-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsConfigPathsPlugin({ baseUrl: "../" })],
  },
  plugins: [
    new ReplaceInFileWebpackPlugin([{
      dir: 'dist',
      files: ['bundle.js', 'bundle.js.map'],
      rules: [{
        search: /\.\.\/core\/src/ig,  //../core/src -> ./src/core
        replace: './src/core'
      }]
    }])
  ],
};