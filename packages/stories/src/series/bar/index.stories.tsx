import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicBarSeries from "./basicBarSeries";

storiesOf("Series", module)
    .add("Bar", () => {
        return (
            <BasicBarSeries />
        );
    });
