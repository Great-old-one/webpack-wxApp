const merge = require("webpack-merge")
const common = require("./webpack.base")
const webpack = require('webpack')
const FriendlyErrorsPlugin=require("friendly-errors-webpack-plugin")

module.exports = merge(common,
    {
        mode: "development",
        devtool: 'inline-source-map',
        plugins: [
            new webpack.NoEmitOnErrorsPlugin(),
            new FriendlyErrorsPlugin()
        ]
    }
)
