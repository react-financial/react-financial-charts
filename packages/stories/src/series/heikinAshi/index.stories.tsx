import * as React from "react";
import { CandlestickSeries } from "react-financial-charts/lib/series";
import BasicHeikinAshiSeries from "./basicHeikinAshiSeries";

export default {
    title: "Visualization|Series/Heikin Ashi",
    component: CandlestickSeries,
};

export const basic = () => <BasicHeikinAshiSeries />;
