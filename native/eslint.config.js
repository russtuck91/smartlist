import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';

import baseConfig from '../eslint.config.base.js';


const removePlugins = (configs, pluginNames) =>
    configs.map((config) => ({
        ...config,
        plugins: Object.fromEntries(
            Object.entries(config.plugins || {}).filter(([key]) => !pluginNames.includes(key)),
        ),
    }));

export default defineConfig([
    ...baseConfig,
    ...removePlugins(expoConfig, ['import', '@typescript-eslint']),
]);
