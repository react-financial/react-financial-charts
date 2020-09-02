import * as React from "react";
import { RenkoSeries } from "../../../../series/src/RenkoSeries";
import { Daily, Intraday } from "./BasicRenkoSeries";

export default {
    component: RenkoSeries,
    title: "Visualization/Series/Renko",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
