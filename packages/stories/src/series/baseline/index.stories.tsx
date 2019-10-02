import * as React from "react";
import { AlternatingFillAreaSeries } from "react-financial-charts/lib/series";
import BasicBaselineSeries from "./basicBaselineSeries";

export default {
    component: AlternatingFillAreaSeries,
    title: "Visualization|Series/Baseline",
};

export const basic = () => <BasicBaselineSeries />;
