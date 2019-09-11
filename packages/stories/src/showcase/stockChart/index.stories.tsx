import { storiesOf } from "@storybook/react";
import * as React from "react";
import StockChart from "./stockChart";

storiesOf("Showcase|Charts", module)
    .add("Stockchart", () => <StockChart />, {
        options: {
            showPanel: false,
        },
    });
