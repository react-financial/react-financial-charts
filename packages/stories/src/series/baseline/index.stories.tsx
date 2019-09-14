import * as React from "react";
import { AlternatingFillAreaSeries } from "react-financial-charts/lib/series";
import BasicBaselineSeries from "./basicBaselineSeries";

export default {
    title: "Visualization|Series/Baseline",
    component: AlternatingFillAreaSeries,
};

export const basic = () => <BasicBaselineSeries />;
