const { babelInclude, override, removeModuleScopePlugin, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = override(
    removeModuleScopePlugin(),
    babelInclude([
        path.resolve('src'),
        path.resolve('../shared/src'),
    ]),
    addWebpackPlugin(
        new GenerateSW({
            skipWaiting: true,
        }),
    ),
);
