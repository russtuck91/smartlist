const { babelInclude, override, removeModuleScopePlugin } = require('customize-cra');
const path = require('path');

module.exports = override(
    removeModuleScopePlugin(),
    babelInclude([
        path.resolve('src'),
        path.resolve('../shared/src')
    ])
);