const path = require('path')
const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  output: {
    // 多出口 dev环境下不启用hash
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  devtool: 'eval-cheap-module-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 7864,
    open: true,
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin() // HMR
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/i,
        exclude: [/node_modules/, /dist/],
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[path][name].[ext]' // [path]===/src/assets/img/
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, /dist/],
        use: 'eslint-loader'
      }
    ]
  }
})
