var config = require('../config')
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = JSON.parse(config.dev.env.NODE_ENV)
}
var webpack = require('webpack')
var webpackConfig = require('./webpack.dev')
var compiler = webpack(webpackConfig)
var chalk = require("chalk")

console.log(chalk.green('> Starting dev compiler...'))

require('webpack-dev-middleware-hard-disk')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
})
