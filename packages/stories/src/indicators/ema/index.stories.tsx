import { storiesOf } from "@storybook/react";
import * as React from "react";
import EMAIndicator from "./emaIndicator";

storiesOf("Indicators", module)
    .add("EMA", () => {
        return (
            <EMAIndicator />
        );
    });
