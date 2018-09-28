const path = require('path')
const cleanWebpackPlugin = require("clean-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const glob = require("glob")
const wxAppWebpackPlugin = require("bx-wxapp-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const utils = require("./utils")
const webpack = require("webpack")
const wxappNpmPlugin = require("bx-wxapp-npm-plugin")

var config = require('../config')

function resolve(dir) {
    return path.join(__dirname, "../", dir)
}

function getEntry(rootSrc, pattern) {
    var files = glob.sync(path.resolve(rootSrc, pattern))
    return files.reduce((res, file) => {
        var info = path.parse(file)
        var key = "/" + info.dir.slice(rootSrc.length + 1) + '/' + info.name
        res[key] = path.resolve(file)
        return res
    }, {})
}

//应用入口
const appEntry = {main: './src/main.js'}
//页面入口
const pagesEntry = getEntry(resolve('./src'), 'pages/**/index.js')
//组件入口
const componentsEntry = getEntry(resolve('./src'), 'components/**/index.js')

const entry = Object.assign({}, appEntry, pagesEntry, componentsEntry)
module.exports = {
    entry: entry,
    output: {
        filename: "[name].js",
        path: resolve("dist"),
        globalObject: "global",
        publicPath: process.env.NODE_ENV === 'production'
            ? config.build.assetsPublicPath
            : config.dev.assetsPublicPath
    },
    //must not be eval
    devtool: "none",
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    "chunks": "all",
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                }
            }
        },
        runtimeChunk: 'single'
    },
    resolve: {
        extensions: ['.js', '.json', '.ts',],
        alias: {
            '@': resolve('src'),
        },
        symlinks: false
    },
    module: {
        rules: [
            {
                test: /\.(sa|sc|c|le)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg|png|gif|jpeg|jpg)\??.*$/,
                loader: 'url-loader',
                query: {
                    limit: 50000,
                    name: utils.assetsPath('img/[name].[ext]')
                }
            }
        ]
    },

    plugins: [
        new cleanWebpackPlugin([resolve("./dist")], {root: resolve("./")}),
        new CopyWebpackPlugin(
            [{from: "./", to: "./"}],
            {
                ignore: ['*.js', '*.css', '*.ts', '*.scss', "*.less", "*.sass"],
                context: resolve('src'),
            }
        ),
        new wxAppWebpackPlugin({
            filename: "app.js"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].wxss"
        }),
        new LodashModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': config.dev.env
        }),
        new wxappNpmPlugin()
    ]
}