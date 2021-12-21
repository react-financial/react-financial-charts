import * as React from "react";
import { CandlestickSeries } from "../../../../series/src/CandlestickSeries.js";
import { Daily, Intraday } from "./BasicHeikinAshiSeries.js";

export default {
    component: CandlestickSeries,
    title: "Visualization/Series/Heikin Ashi",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
