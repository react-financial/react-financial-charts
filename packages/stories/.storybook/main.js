/** @type {import('@storybook/react/types').StorybookConfig} */
module.exports = {
    addons: ["@storybook/addon-essentials"],
    stories: ["../src/**/*.stories.(ts|tsx|mdx)"],
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.(js|map)$/,
            use: "source-map-loader",
            enforce: "pre",
        });

        return config;
    },
    reactOptions: {
        strictMode: true,
        fastRefresh: true,
    },
};
