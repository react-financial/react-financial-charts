import * as React from "react";
import { OHLCSeries } from "react-financial-charts/lib/series";
import BasicOHLCSeries from "./basicOHLCSeries";

export default {
    title: "Visualization|Series/OHLC",
    component: OHLCSeries,
};

export const basic = () => <BasicOHLCSeries />;
