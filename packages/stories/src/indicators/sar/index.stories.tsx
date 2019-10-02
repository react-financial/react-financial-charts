import * as React from "react";
import { SARSeries } from "react-financial-charts/lib/series";
import SARIndicator from "./sarIndicator";

export default {
    component: SARSeries,
    parameters: {
        componentSubtitle: `SAR stands for 'stop and reverse'.
        The indicator is below prices as they're rising and above
        prices as they're falling. In this regard, the indicator
        stops and reverses when the price trend reverses and breaks above or below the indicator.`,
    },
    title: "Visualization|Indicator/SAR",
};

export const basic = () => <SARIndicator />;
