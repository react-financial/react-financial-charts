import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicHeikinAshiSeries from "./basicHeikinAshiSeries";

storiesOf("Series|Heikin Ashi", module)
    .add("Basic", () => {
        return (
            <BasicHeikinAshiSeries />
        );
    });
