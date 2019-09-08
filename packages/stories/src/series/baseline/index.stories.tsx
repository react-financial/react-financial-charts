import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicBaselineSeries from "./basicBaselineSeries";

storiesOf("Baseline", module)
    .add("Basic", () => {
        return (
            <BasicBaselineSeries />
        );
    });
