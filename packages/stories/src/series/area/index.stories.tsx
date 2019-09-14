import * as React from "react";
import { AreaSeries } from "react-financial-charts/lib/series";
import BasicAreaSeries from "./basicAreaSeries";

export default {
    title: "Visualization|Series/Area",
    component: AreaSeries,
};

export const basic = () => <BasicAreaSeries />;
