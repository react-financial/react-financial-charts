import * as React from "react";
import { BarSeries } from "../../../../series/src/BarSeries";
import { Daily, Intraday } from "./basicBarSeries";

export default {
    component: BarSeries,
    title: "Visualization/Series/Bar",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
