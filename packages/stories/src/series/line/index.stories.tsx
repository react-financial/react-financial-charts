import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicLineSeries from "./basicLineSeries";

storiesOf("Series|Line", module)
    .add("Basic", () => {
        return (
            <BasicLineSeries />
        );
    });
