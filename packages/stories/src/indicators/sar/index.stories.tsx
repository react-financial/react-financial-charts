import * as React from "react";
import { SARSeries } from "../../../../series/src/SARSeries.js";
import SARIndicator from "./SarIndicator.js";

export default {
    title: "Visualization/Indicator/SAR",
    component: SARSeries,
};

export const basic = () => <SARIndicator />;
