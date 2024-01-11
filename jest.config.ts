export default {
    // collectCoverageFrom: [
    //     'src/**/*.{ts,tsx}'
    // ],
    // globals: {
    // },
    coverageProvider: 'v8',
    testMatch: [
        '<rootDir>/test/**/*.(spec|test).{ts,tsx}'
    ],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: 'test/tsconfig.json'
            }
        ]
    },
};