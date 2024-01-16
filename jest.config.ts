const commonConfig = {
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
    ],
    injectGlobals: false,
    transform: {
        "^.+\\.(ts|js)x?$": [
            'ts-jest',
            {
                tsconfig: 'test/tsconfig.json'
            }
        ]
    }
};

export default {
    coverageProvider: 'v8', // To get correct line numbers under jsdom
    projects: [{
        ...commonConfig,
        testEnvironment: 'node',
        testMatch: [
            '<rootDir>/test/**/*.(spec|test).{ts,tsx}'
        ]
    }, {
        ...commonConfig,
        testEnvironment: 'jsdom',
        testMatch: [
            '<rootDir>/test/**/*.(spec|test).client.{ts,tsx}'
        ]
    }]
};