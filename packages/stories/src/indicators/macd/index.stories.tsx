import * as React from "react";
import { MACDSeries } from "react-financial-charts/lib/series";
import MACDIndicator from "./macdIndicator";

export default {
    title: "Visualization|Indicator/MACD",
    component: MACDSeries,
    parameters: {
        componentSubtitle:
            "The MACD turns two trend-following indicators, moving averages, into a momentum oscillator by subtracting the longer moving average from the shorter one.",
    },
};

export const basic = () => <MACDIndicator />;
