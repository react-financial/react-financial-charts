import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicBaselineSeries from "./basicBaselineSeries";

storiesOf("Series", module)
    .add("Baseline", () => {
        return (
            <BasicBaselineSeries />
        );
    });
