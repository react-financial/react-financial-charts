import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicBaselineSeries from "./basicBaselineSeries";

storiesOf("Series|Baseline", module)
    .add("Basic", () => {
        return (
            <BasicBaselineSeries />
        );
    });
