import * as React from "react";
import { LineSeries } from "react-financial-charts/lib/series";
import EMAIndicator from "./emaIndicator";

export default {
    component: LineSeries,
    parameters: {
        componentSubtitle: "Moving averages smooth the price data to form a trend following indicator.",
    },
    title: "Visualization|Indicator/EMA",
};

export const basic = () => <EMAIndicator />;
