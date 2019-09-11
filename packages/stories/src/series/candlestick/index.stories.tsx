import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicCandlestickSeries from "./basicCandlestick";

storiesOf("Series", module)
    .add("Candles", () => <BasicCandlestickSeries />, {
        options: {
            showPanel: true,
        },
    });
