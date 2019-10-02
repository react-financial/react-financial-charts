import * as React from "react";
import { CandlestickSeries } from "react-financial-charts/lib/series";
import BasicHeikinAshiSeries from "./basicHeikinAshiSeries";

export default {
    component: CandlestickSeries,
    title: "Visualization|Series/Heikin Ashi",
};

export const basic = () => <BasicHeikinAshiSeries />;
