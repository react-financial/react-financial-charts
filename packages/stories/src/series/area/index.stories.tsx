import * as React from "react";
import { AreaSeries } from "react-financial-charts/lib/series";
import BasicAreaSeries from "./basicAreaSeries";

export default {
    component: AreaSeries,
    title: "Visualization|Series/Area",
};

export const basic = () => <BasicAreaSeries />;
