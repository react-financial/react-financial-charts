import * as React from "react";
import { StochasticSeries } from "../../../../series/src/StochasticSeries";
import StoIndicator from "./StoIndicator";

export default {
    title: "Visualization/Indicator/Stochastic Oscillator",
    component: StochasticSeries,
};

export const basic = () => <StoIndicator />;
