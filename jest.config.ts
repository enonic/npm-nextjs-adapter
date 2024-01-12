export default {
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}'
    ],

    coverageProvider: 'v8',

    testEnvironment: 'node',

    testMatch: [
        '<rootDir>/test/**/*.(spec|test).{ts,tsx}'
    ],
    transform: {
        "^.+\\.(ts|js)x?$": [
            'ts-jest',
            {
                tsconfig: 'test/tsconfig.json'
            }
        ]
    },
};