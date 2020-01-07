import * as React from "react";
import { AlternatingFillAreaSeries } from "react-financial-charts/lib/series";
import { Daily, Intraday } from "./basicBaselineSeries";

export default {
    component: AlternatingFillAreaSeries,
    title: "Visualization|Series/Baseline",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
