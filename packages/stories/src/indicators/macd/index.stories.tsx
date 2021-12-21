import * as React from "react";
import { MACDSeries } from "../../../../series/src/MACDSeries.js";
import MACDIndicator from "./MacdIndicator.js";

export default {
    title: "Visualization/Indicator/MACD",
    component: MACDSeries,
};

export const basic = () => <MACDIndicator />;
