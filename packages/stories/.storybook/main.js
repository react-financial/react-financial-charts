module.exports = {
    addons: [
        "@storybook/addon-docs",
        "@storybook/addon-essentials",
    ],
    stories: ["../src/**/*.stories.(js|jsx|ts|tsx|mdx)"],
    webpackFinal: async config => {
        config.module.rules.push({
            test: /\.(js)$/,
            enforce: "pre",
            use: [
                {
                    loader: require.resolve("source-map-loader"),
                }
            ],
        });
        config.module.rules.push({
            test: /\.(ts|tsx)$/,
            use: [
                {
                    loader: require.resolve("ts-loader"),
                },
                {
                    loader: require.resolve("react-docgen-typescript-loader"),
                },
            ],
        });
        config.resolve.extensions.push(".ts", ".tsx");
        return config;
    },
};
