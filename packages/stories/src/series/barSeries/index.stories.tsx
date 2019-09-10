import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicBarSeries from "./basicBarSeries";

storiesOf("Series|Bar", module)
    .add("Basic", () => {
        return (
            <BasicBarSeries />
        );
    });
