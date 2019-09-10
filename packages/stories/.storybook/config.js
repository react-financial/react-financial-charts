import { addParameters, configure } from "@storybook/react";
import theme from "./theme";

addParameters({
    options: {
        theme,
    },
});

function loadStories() {
    const req = require.context("../src", true, /.stories.tsx$/);
    req
        .keys()
        .forEach(filename => req(filename));
}

configure(loadStories, module);
