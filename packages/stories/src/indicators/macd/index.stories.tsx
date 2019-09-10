import { storiesOf } from "@storybook/react";
import * as React from "react";
import MACDIndicator from "./macdIndicator";

storiesOf("Indicators", module)
    .add("MACD", () => {
        return (
            <MACDIndicator />
        );
    });
