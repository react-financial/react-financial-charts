import { addParameters, configure } from "@storybook/react";
import { create } from '@storybook/theming';

addParameters({
    options: {
        theme: create({
            base: "light",
            brandTitle: 'React Financial Charts',
            brandUrl: 'https://github.com/reactivemarkets/react-financial-charts',
        }),
    },
});

configure(
    [
        require.context("../src", true, /\.stories\.mdx$/),
        require.context("../src", true, /\.stories\.tsx$/),
    ],
    module
);
