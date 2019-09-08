import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicBarSeries from "./basicBarSeries";

storiesOf("Bar Series", module)
    .add("Basic", () => {
        return (
            <BasicBarSeries />
        );
    });
