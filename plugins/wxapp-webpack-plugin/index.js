const _ = require("lodash")
const path = require("path")
const chunkSorter = require('./lib/chunksorter.js');

class WxappWebpackPlugin {
    constructor(options) {
        this.options = _.extend({
            filename: "index.js",
            chunks: 'all',
            excludeChunks: [],
            chunksSortMode: 'auto',
        }, options)
    }

    apply(compiler) {
        compiler.hooks.emit.tapAsync("WxappWebpackPlugin", (compilation, callback) => {
            const chunkOnlyConfig = {
                assets: false,
                cached: false,
                children: false,
                chunks: true,
                chunkModules: false,
                chunkOrigins: false,
                errorDetails: false,
                hash: false,
                modules: false,
                reasons: false,
                source: false,
                timings: false,
                version: false
            };
            const allChunks = compilation.getStats().toJson(chunkOnlyConfig).chunks;
            // Filter chunks (options.chunks and options.excludeCHunks)
            let chunks = this.filterChunks(allChunks, this.options.chunks, this.options.excludeChunks);

            //just adapt to wxApp
            chunks = chunks.filter((chunk) => {
                const chunkName = chunk.names[0]
                if (chunkName.indexOf("/") === -1) {
                    return true
                }
            })
            // Sort chunks
            chunks = this.sortChunks(chunks, this.options.chunksSortMode, compilation);

            //generate content
            const sourceContent = chunks.reduce((content, chunk) => {
                const chunkName = chunk.names[0]
                content += "require('./" + chunkName + "');"
                return content
            }, "")

            //write content
            compilation.assets[this.options.filename] = {
                source() {
                    return sourceContent
                },
                size() {
                    return sourceContent.length
                }
            }
            callback()
        })
    }

    filterChunks(chunks, includedChunks, excludedChunks) {
        return chunks.filter(chunk => {
            const chunkName = chunk.names[0];
            // This chunk doesn't have a name. This script can't handled it.
            if (chunkName === undefined) {
                return false;
            }
            // Skip if the chunk should be lazy loaded
            if (typeof chunk.isInitial === 'function') {
                if (!chunk.isInitial()) {
                    return false;
                }
            } else if (!chunk.initial) {
                return false;
            }
            // Skip if the chunks should be filtered and the given chunk was not added explicity
            if (Array.isArray(includedChunks) && includedChunks.indexOf(chunkName) === -1) {
                return false;
            }
            // Skip if the chunks should be filtered and the given chunk was excluded explicity
            if (Array.isArray(excludedChunks) && excludedChunks.indexOf(chunkName) !== -1) {
                return false;
            }
            // Add otherwise
            return true;
        });
    }

    sortChunks(chunks, sortMode, compilation) {
        // Custom function
        if (typeof sortMode === 'function') {
            return chunks.sort(sortMode);
        }
        // Check if the given sort mode is a valid chunkSorter sort mode
        if (typeof chunkSorter[sortMode] !== 'undefined') {
            return chunkSorter[sortMode](chunks, this.options, compilation);
        }
        throw new Error('"' + sortMode + '" is not a valid chunk sort mode');
    }
}

module.exports = WxappWebpackPlugin