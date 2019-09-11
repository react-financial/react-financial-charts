import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicLineSeries from "./basicLineSeries";

storiesOf("Series", module)
    .add("Line", () => <BasicLineSeries />, {
        options: {
            showPanel: true,
        },
    });
