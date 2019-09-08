import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicAreaSeries from "./basicAreaSeries";

storiesOf("AreaSeries", module)
    .add("Basic", () => {
        return (
            <BasicAreaSeries />
        );
    });
