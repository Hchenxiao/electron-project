/**
 * @description 主进程webpack配置文件
 */
'use strict'
process.env.BABEL_ENV = 'main'

const path = require('path')
const webpack = require('webpack')

// 项目依赖，保证安装依赖是确定 dependencies / devdependencies
const { dependencies } = require('../package.json')
const config = require('../config')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

let mainConfig = {
  // 主进程单入口文件/mian/index
  entry: {
    main: path.join(__dirname, '../src/main/index.ts'),
  },
  // 外部扩展 防止将import的包打包到bundle，是要在运行时再从外部获取
  externals: [...Object.keys(dependencies || {})],
  module: {
    rules: [
      // 类似于babel的代码转译器，把ES2015或者更改版本的JS代码转换为浏览器能够使用的ES5或者更低版本的JS代码
      // 官网说法 SWC速度比Babel快20倍
      {
        test: /\.m?[jt]s$/,
        loader: 'swc-loader',
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron'),
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.TERGET_ENV': JSON.stringify(config[process.env.TERGET_ENV]),
    }),
  ],
  resolve: {
    alias: {
      '@config': resolve('config'),
    },
    extensions: ['.tsx', '.ts', '.js', '.json', '.node'],
  },
  target: 'electron-main',
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
      'process.env.libPath': `"${path
        .join(__dirname, `../${config.DllFolder}`)
        .replace(/\\/g, '\\\\')}"`,
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    })
  )
}

module.exports = mainConfig
