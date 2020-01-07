import * as React from "react";
import { BarSeries } from "react-financial-charts/lib/series";
import { Daily, Intraday } from "./basicBarSeries";

export default {
    component: BarSeries,
    title: "Visualization|Series/Bar",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
