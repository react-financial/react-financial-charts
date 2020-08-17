import * as React from "react";
import EMAIndicator from "./EmaIndicator";

export default {
    title: "Visualization/Indicator/EMA",
    parameters: {
        componentSubtitle: "Moving averages smooth the price data to form a trend following indicator.",
    },
};

export const basic = () => <EMAIndicator />;
