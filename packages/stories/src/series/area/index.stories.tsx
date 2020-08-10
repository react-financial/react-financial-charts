import * as React from "react";
import { AreaSeries } from "../../../../series/src/AreaSeries";
import { Daily, Intraday } from "./basicAreaSeries";

export default {
    component: AreaSeries,
    title: "Visualization/Series/Area",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
