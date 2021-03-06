const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)
const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin') // runtime内联到html文件中，减少http请求
const TerserJSPlugin = require('terser-webpack-plugin') // 压缩js代码

module.exports = merge(common, {
  mode: 'production', // 防止控制台报错
  output: {
    // 多出口 prod环境下启用hash
    filename: 'js/[name].[hash:8].bundle.js',
    path: resolve('dist'),
    publicPath: '/'
  },
  optimization: {
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          compress: {
            drop_console: true // 移除console
          },
          output: {
            comments: false // 移除js中的注释
          }
        }
      })
    ],
    runtimeChunk: true, // 防止app.js缓存失效
    splitChunks: {
      chunks: 'all', // 异步模块和入口模块
      minSize: 30000,
      minChunks: 1, // 最少有多少chunks共用的模块
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          minChunks: 1,
          priority: 20 // 权重
        },
        default: {
          name: 'default',
          test: resolve('src/utils'),
          minChunks: 1,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ScriptExtHtmlWebpackPlugin({
      inline: /runtime~.*\.js$/ // 内联runtimeChunk到html
    })
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
              outputPath: 'img',
              name: '[name].[hash:8].[ext]'
            }
          }
        ]
      },
      {
        enforce: 'pre', // 保证 eslint 优先 babel 执行
        test: /\.js$/,
        exclude: [/node_modules/, /dist/],
        use: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, /dist/],
        use: 'babel-loader'
      }
    ]
  }
})
