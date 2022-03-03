import { Config } from '@jest/types';

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
    transformIgnorePatterns: [
        'node_modules/(?!(@react-native|react-native|react-native-splash-screen|react-native-webview)/)',
    ],
    setupFiles: [
        './testSetup.tsx',
    ],
};

export default config;
