module.exports = {
    preset: "ts-jest",
    collectCoverage: true,
    coverageReporters: ["text", "json"],
    errorOnDeprecated: true,
    testMatch: ["**/__tests__/**/*.+(ts|tsx)"],
};
