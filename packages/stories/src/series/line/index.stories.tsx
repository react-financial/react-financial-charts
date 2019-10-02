import * as React from "react";
import { LineSeries } from "react-financial-charts/lib/series";
import BasicLineSeries from "./basicLineSeries";

export default {
    component: LineSeries,
    title: "Visualization|Series/Line",
};

export const basic = () => <BasicLineSeries />;
