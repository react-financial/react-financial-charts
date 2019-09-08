import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicRenkoSeries from "./basicRenkoSeries";

storiesOf("Renko", module)
    .add("Basic", () => {
        return (
            <BasicRenkoSeries />
        );
    });
