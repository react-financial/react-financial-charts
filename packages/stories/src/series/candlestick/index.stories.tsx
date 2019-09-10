import { storiesOf } from "@storybook/react";
import * as React from "react";
import BasicCandlestick from "./basicCandlestick";
import StockChart from "./stockChart";

storiesOf("Series|Candles", module)
    .add("Basic", () => {
        return (
            <BasicCandlestick />
        );
    })
    .add("Stock Chart", () => {
        return (
            <StockChart />
        );
    });
