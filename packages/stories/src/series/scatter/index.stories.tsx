import * as React from "react";
import { ScatterSeries } from "../../../../series/src/ScatterSeries.js";
import BasicScatterSeries from "./BasicScatterSeries.js";

export default {
    component: ScatterSeries,
    title: "Visualization/Series/Scatter",
};

export const bubble = () => <BasicScatterSeries />;
