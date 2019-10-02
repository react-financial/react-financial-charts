import * as React from "react";
import { RSISeries } from "react-financial-charts/lib/series";
import RSIIndicator from "./rsiIndicator";

export default {
    component: RSISeries,
    parameters: {
        componentSubtitle: "The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and change of price movements.",
    },
    title: "Visualization|Indicator/RSI",
};

export const basic = () => <RSIIndicator />;
