import * as React from "react";
import { CandlestickSeries } from "../../../../series/src/CandlestickSeries";
import { Daily, Intraday } from "./BasicHeikinAshiSeries";

export default {
    component: CandlestickSeries,
    title: "Visualization/Series/Heikin Ashi",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
