import * as React from "react";
import { RenkoSeries } from "../../../../series/src/RenkoSeries.js";
import { Daily, Intraday } from "./BasicRenkoSeries.js";

export default {
    component: RenkoSeries,
    title: "Visualization/Series/Renko",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
