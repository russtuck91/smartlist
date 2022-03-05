import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'react-native',
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
        'node',
    ],
    setupFiles: [
        './testSetup.tsx',
    ],
};

export default config;
