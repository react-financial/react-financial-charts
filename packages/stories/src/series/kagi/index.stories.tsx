import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicKagiSeries from "./basicKagiSeries";

storiesOf("Series", module)
    .add("Kagi", () => {
        return (
            <BasicKagiSeries />
        );
    });
