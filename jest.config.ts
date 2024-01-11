export default {
    // collectCoverageFrom: [
    //     'src/**/*.{ts,tsx}'
    // ],
    // globals: {
    // },
    coverageProvider: 'v8',

    // testEnvironment: 'jsdom',
    testEnvironment: 'node',

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
    // transformIgnorePatterns: [
	// 	'/node_modules/(?!node-fetch-native)',
	// ]
};