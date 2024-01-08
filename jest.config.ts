export default {
    // collectCoverageFrom: [
    //     'src/**/*.{ts,tsx}'
    // ],
    // globals: {
    // },
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