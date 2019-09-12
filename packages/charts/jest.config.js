module.exports = {
    preset: 'ts-jest',
    collectCoverage: true,
    coverageReporters: ["text"],
    errorOnDeprecated: true,
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx)"
    ],
};
