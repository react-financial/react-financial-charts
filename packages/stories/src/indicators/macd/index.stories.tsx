import { storiesOf } from "@storybook/react";
import * as React from "react";
import MACDIndicator from "./macdIndicator";
import markdown from "./notes.md";

storiesOf("Indicators", module)
    .add("MACD", () => <MACDIndicator />, {
        notes: {
            markdown,
        },
        options: {
            showPanel: true,
        },
    });
