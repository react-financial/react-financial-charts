import * as React from "react";
import { CandlestickSeries } from "react-financial-charts/lib/series";
import BasicCandlestickSeries from "./basicCandlestick";

export default {
    component: CandlestickSeries,
    title: "Visualization|Series/Candles",
};

export const basic = () => <BasicCandlestickSeries />;
