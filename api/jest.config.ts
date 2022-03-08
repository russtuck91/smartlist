import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFiles: [
        './setupTests.ts',
    ],
    testPathIgnorePatterns: [
        'build/',
    ],
};

export default config;
