import * as React from "react";
import { MACDSeries } from "react-financial-charts/lib/series";
import MACDIndicator from "./macdIndicator";

export default {
    component: MACDSeries,
    parameters: {
        componentSubtitle: "The MACD turns two trend-following indicators, moving averages, into a momentum oscillator by subtracting the longer moving average from the shorter one.",
    },
    title: "Visualization|Indicator/MACD",
};

export const basic = () => <MACDIndicator />;
