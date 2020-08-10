import * as React from "react";
import { forceIndex } from "@react-financial-charts/indicators";
import ForceIndicator from "./ForceIndicator";

export default {
    title: "Visualization/Indicator/Force Index",
    component: forceIndex,
    parameters: {
        componentSubtitle: `The Force Index is an indicator that uses price
        and volume to assess the power behind a move or identify possible
        turning points.`,
    },
};

export const basic = () => <ForceIndicator />;
