import * as React from "react";
import { RenkoSeries } from "react-financial-charts/lib/series";
import BasicRenkoSeries from "./basicRenkoSeries";

export default {
    component: RenkoSeries,
    title: "Visualization|Series/Renko",
};

export const basic = () => <BasicRenkoSeries />;
