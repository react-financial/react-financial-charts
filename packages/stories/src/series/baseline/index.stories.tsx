import * as React from "react";
import { AlternatingFillAreaSeries } from "../../../../series/src/AlternatingFillAreaSeries";
import { Daily, Intraday } from "./basicBaselineSeries";

export default {
    component: AlternatingFillAreaSeries,
    title: "Visualization/Series/Baseline",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
