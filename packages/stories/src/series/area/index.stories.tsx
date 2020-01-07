import * as React from "react";
import { AreaSeries } from "react-financial-charts/lib/series";
import { Daily, Intraday } from "./basicAreaSeries";

export default {
    component: AreaSeries,
    title: "Visualization|Series/Area",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
