import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicAreaSeries from "./basicAreaSeries";

storiesOf("Series|Area", module)
    .add("Basic", () => {
        return (
            <BasicAreaSeries />
        );
    });
