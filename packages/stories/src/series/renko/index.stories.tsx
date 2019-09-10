import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicRenkoSeries from "./basicRenkoSeries";

storiesOf("Series|Renko", module)
    .add("Basic", () => {
        return (
            <BasicRenkoSeries />
        );
    });
