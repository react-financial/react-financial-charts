module.exports = {
    preset: 'ts-jest',
    collectCoverage: true,
    coverageReporters: ["text-summary"],
    errorOnDeprecated: true,
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx)"
    ],
};
