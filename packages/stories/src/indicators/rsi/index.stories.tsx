import { storiesOf } from "@storybook/react";
import * as React from "react";
import RSIIndicator from "./rsiIndicator";

storiesOf("Indicators", module)
    .add("RSI", () => {
        return (
            <RSIIndicator />
        );
    });
