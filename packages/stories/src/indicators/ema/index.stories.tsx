import { storiesOf } from "@storybook/react";
import * as React from "react";
import EMAIndicator from "./emaIndicator";

storiesOf("Indicators", module)
    .add("EMA", () => <EMAIndicator />, {
        options: {
            showPanel: true,
        },
    });
