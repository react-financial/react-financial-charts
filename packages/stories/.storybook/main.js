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
    ],
    stories: ["../src/**/*.stories.(js|jsx|ts|tsx|mdx)"],
};
