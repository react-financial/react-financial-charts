import * as React from "react";
import { forceIndex } from "react-financial-charts/lib/indicator";
import ForceIndicator from "./forceIndicator";

export default {
    component: forceIndex,
    parameters: {
        componentSubtitle: `The Force Index is an indicator that uses price
        and volume to assess the power behind a move or identify possible
        turning points.`,
    },
    title: "Visualization|Indicator/Force Index",
};

export const basic = () => <ForceIndicator />;
