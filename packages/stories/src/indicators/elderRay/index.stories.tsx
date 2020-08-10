import * as React from "react";
import { forceIndex } from "@react-financial-charts/indicators";
import ElderRayIndicator from "./ElderRayIndicator";

export default {
    title: "Visualization/Indicator/Elder Ray",
    component: forceIndex,
    parameters: {
        componentSubtitle: `This indicator consists of three separate indicators
        known as "bull power" and "bear power", which are derived from a 13-period
        exponential moving average (EMA). The three indicator help traders determine
        the trend direction and isolate spots to enter and exit trades.`,
    },
};

export const basic = () => <ElderRayIndicator />;
