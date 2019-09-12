import { storiesOf } from "@storybook/react";
import * as React from "react";
import markdown from "./notes.md";
import SARIndicator from "./sarIndicator";

storiesOf("Indicators", module)
    .add("SAR", () => <SARIndicator />, {
        notes: {
            markdown,
        },
        options: {
            showPanel: true,
        },
    });
