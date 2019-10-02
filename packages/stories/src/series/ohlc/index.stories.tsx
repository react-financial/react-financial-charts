import * as React from "react";
import { OHLCSeries } from "react-financial-charts/lib/series";
import BasicOHLCSeries from "./basicOHLCSeries";

export default {
    component: OHLCSeries,
    title: "Visualization|Series/OHLC",
};

export const basic = () => <BasicOHLCSeries />;
