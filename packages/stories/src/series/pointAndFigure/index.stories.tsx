import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicPointAndFigureSeries from "./basicPointAndFigureSeries";

storiesOf("Series", module)
    .add("Point & Figure", () => <BasicPointAndFigureSeries />, {
        options: {
            showPanel: true,
        },
    });
