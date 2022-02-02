const { babelInclude, override, removeModuleScopePlugin, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = override(
    removeModuleScopePlugin(),
    babelInclude([
        path.resolve('src'),
        path.resolve('../shared/src'),
    ]),
    process.env.NODE_ENV !== 'development' ?
        addWebpackPlugin(
            new GenerateSW({
                skipWaiting: true,
                clientsClaim: true,
            }),
        ) : null,
);
