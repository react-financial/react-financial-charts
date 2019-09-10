import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicAreaSeries from "./basicAreaSeries";

storiesOf("Series", module)
    .add("Area", () => {
        return (
            <BasicAreaSeries />
        );
    });
