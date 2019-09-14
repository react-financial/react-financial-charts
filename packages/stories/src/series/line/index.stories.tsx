import * as React from "react";
import { LineSeries } from "react-financial-charts/lib/series";
import BasicLineSeries from "./basicLineSeries";

export default {
    title: "Visualization|Series/Line",
    component: LineSeries,
};

export const basic = () => <BasicLineSeries />;
