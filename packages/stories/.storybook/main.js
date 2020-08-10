const path = require("path");

module.exports = {
    addons: [
        {
            name: "@storybook/addon-docs",
            options: {
                configureJSX: true,
            },
        },
        "@storybook/addon-essentials",
        "@storybook/addon-actions/register",
        "@storybook/addon-knobs/register",
        "@storybook/addon-notes/register",
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
                    options: {
                        // Provide the path to your tsconfig.json so that your stories can
                        // display types from outside each individual story.
                        tsconfigPath: path.resolve(__dirname, "../tsconfig.json"),
                      },
                },
            ],
        });
        config.resolve.extensions.push(".ts", ".tsx");
        return config;
    },
};
