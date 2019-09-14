import * as React from "react";
import { BarSeries } from "react-financial-charts/lib/series";
import BasicBarSeries from "./basicBarSeries";

export default {
    title: "Visualization|Series/Bar",
    component: BarSeries,
};

export const basic = () => <BasicBarSeries />;
