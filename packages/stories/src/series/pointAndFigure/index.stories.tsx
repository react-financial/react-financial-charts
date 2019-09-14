import * as React from "react";
import { PointAndFigureSeries } from "react-financial-charts/lib/series";
import BasicPointAndFigureSeries from "./basicPointAndFigureSeries";

export default {
    title: "Visualization|Series/Point & Figure",
    component: PointAndFigureSeries,
};

export const basic = () => <BasicPointAndFigureSeries />;
