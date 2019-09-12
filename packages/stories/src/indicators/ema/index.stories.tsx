import { storiesOf } from "@storybook/react";
import * as React from "react";
import EMAIndicator from "./emaIndicator";
import markdown from "./notes.md";

storiesOf("Indicators", module)
    .add("EMA", () => <EMAIndicator />, {
        notes: {
            markdown,
        },
        options: {
            showPanel: true,
        },
    });
