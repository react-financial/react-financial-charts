import * as React from "react";
import { CandlestickSeries } from "../../../../series/src/CandlestickSeries.js";
import { Daily, Intraday } from "./BasicCandlestick.js";

export default {
    component: CandlestickSeries,
    title: "Visualization/Series/Candles",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
