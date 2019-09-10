import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicHeikinAshiSeries from "./basicHeikinAshiSeries";

storiesOf("Series", module)
    .add("Heikin Ashi", () => {
        return (
            <BasicHeikinAshiSeries />
        );
    });
