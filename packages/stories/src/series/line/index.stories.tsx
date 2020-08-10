import * as React from "react";
import { LineSeries } from "../../../../series/src/LineSeries";
import { Daily, Intraday } from "./basicLineSeries";

export default {
    component: LineSeries,
    title: "Visualization/Series/Line",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
