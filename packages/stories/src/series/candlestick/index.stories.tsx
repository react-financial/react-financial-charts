import * as React from "react";
import { CandlestickSeries } from "react-financial-charts/lib/series";
import BasicCandlestickSeries from "./basicCandlestick";

export default {
    title: "Visualization|Series/Candles",
    component: CandlestickSeries,
};

export const basic = () => <BasicCandlestickSeries />;
