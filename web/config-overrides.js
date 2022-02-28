const { babelInclude, override, removeModuleScopePlugin, addWebpackPlugin, addWebpackResolve } = require('customize-cra');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = override(
    removeModuleScopePlugin(),
    babelInclude([
        path.resolve('src'),
        path.resolve('../shared/src'),
    ]),
    addWebpackResolve({
        fallback: {
            'fs': false,
        },
    }),
    addWebpackPlugin(new NodePolyfillPlugin()),
    process.env.NODE_ENV !== 'development' ?
        addWebpackPlugin(
            new GenerateSW({
                skipWaiting: true,
                clientsClaim: true,
            }),
        ) : null,
);
