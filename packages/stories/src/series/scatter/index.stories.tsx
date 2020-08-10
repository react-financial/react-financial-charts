import * as React from "react";
import { ScatterSeries } from "../../../../series/src/ScatterSeries";
import BasicScatterSeries from "./basicScatterSeries";

export default {
    component: ScatterSeries,
    title: "Visualization/Series/Scatter",
};

export const bubble = () => <BasicScatterSeries />;
