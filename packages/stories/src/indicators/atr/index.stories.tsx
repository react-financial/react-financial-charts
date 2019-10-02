import * as React from "react";
import { atr } from "react-financial-charts/lib/indicator";
import ATRIndicator from "./atrIndicator";

export default {
    component: atr,
    parameters: {
        componentSubtitle: "Average True Range (ATR) is an indicator that measures volatility.",
    },
    title: "Visualization|Indicator/ATR",
};

export const basic = () => <ATRIndicator />;
