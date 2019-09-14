import * as React from "react";
import { RenkoSeries } from "react-financial-charts/lib/series";
import BasicRenkoSeries from "./basicRenkoSeries";

export default {
    title: "Visualization|Series/Renko",
    component: RenkoSeries,
};

export const basic = () => <BasicRenkoSeries />;
