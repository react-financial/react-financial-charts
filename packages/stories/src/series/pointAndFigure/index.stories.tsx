import * as React from "react";
import { PointAndFigureSeries } from "react-financial-charts/lib/series";
import { Daily } from "./basicPointAndFigureSeries";

export default {
    component: PointAndFigureSeries,
    title: "Visualization|Series/Point & Figure",
};

export const daily = () => <Daily />;
