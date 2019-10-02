import * as React from "react";
import { BarSeries } from "react-financial-charts/lib/series";
import BasicBarSeries from "./basicBarSeries";

export default {
    component: BarSeries,
    title: "Visualization|Series/Bar",
};

export const basic = () => <BasicBarSeries />;
