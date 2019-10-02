import * as React from "react";
import { PointAndFigureSeries } from "react-financial-charts/lib/series";
import BasicPointAndFigureSeries from "./basicPointAndFigureSeries";

export default {
    component: PointAndFigureSeries,
    title: "Visualization|Series/Point & Figure",
};

export const basic = () => <BasicPointAndFigureSeries />;
