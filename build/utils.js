const path=require("path")
exports.assetsPath = function (_path) {
    /*var assetsSubDirectory = process.env.NODE_ENV === 'production'
        ? config.build.assetsSubDirectory
        : config.dev.assetsSubDirectory*/

    var assetsSubDirectory="static"
    return path.posix.join(assetsSubDirectory, _path)
}