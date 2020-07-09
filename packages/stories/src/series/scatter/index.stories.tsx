import * as React from "react";
import { ScatterSeries } from "@react-financial-charts/series";
import BasicScatterSeries from "./basicScatterSeries";

export default {
    component: ScatterSeries,
    title: "Visualization/Series/Scatter",
};

export const bubble = () => <BasicScatterSeries />;
