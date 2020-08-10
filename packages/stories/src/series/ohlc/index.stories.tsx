import * as React from "react";
import { OHLCSeries } from "../../../../series/src/OHLCSeries";
import { Daily, Intraday } from "./basicOHLCSeries";

export default {
    component: OHLCSeries,
    title: "Visualization/Series/OHLC",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
