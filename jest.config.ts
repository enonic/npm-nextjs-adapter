import type {Config} from '@jest/types';

import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './test'
});

// const jestConfig = await createJestConfig({});
// console.error('jestConfig', jestConfig);

const commonConfig = {
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}'
    ],
    injectGlobals: false,
    transformIgnorePatterns: ["/node_modules/(?!gqlmin)"],
    transform: {
        "^.+\\.tsx?$": [
            'ts-jest',
            {
                tsconfig: './test/tsconfig.json'
            }
        ],
        "^.+\\.jsx?$": [
            "babel-jest",
            {
                "extends": "./test/babel.config.js"
            }
        ]
    }
};

const customJestConfig = {
    coverageProvider: 'v8', // To get correct line numbers under jsdom
    projects: [{
        ...commonConfig,
        testEnvironment: '@edge-runtime/jest-environment',
        // testEnvironment: 'jsdom',
        // testEnvironment: 'node',
        testMatch: [
            '<rootDir>/test/**/*.(spec|test).{ts,tsx}'
        ]
    }, {
        ...commonConfig,
        testEnvironment: 'jsdom',
        testMatch: [
            '<rootDir>/test/**/*.(spec|test).client.{ts,tsx}'
        ]
    }],
    silent: false
}

const jestConfig = createJestConfig(customJestConfig as Config.InitialProjectOptions);

export default jestConfig;
