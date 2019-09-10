import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicPointAndFigureSeries from "./basicPointAndFigureSeries";

storiesOf("Series|Point & Figure", module)
    .add("Basic", () => {
        return (
            <BasicPointAndFigureSeries />
        );
    });
