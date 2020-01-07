import * as React from "react";
import { RenkoSeries } from "react-financial-charts/lib/series";
import { Daily, Intraday } from "./basicRenkoSeries";

export default {
    component: RenkoSeries,
    title: "Visualization|Series/Renko",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
