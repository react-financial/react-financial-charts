import * as React from "react";
import { PointAndFigureSeries } from "../../../../series/src/PointAndFigureSeries.js";
import { Daily } from "./BasicPointAndFigureSeries.js";

export default {
    component: PointAndFigureSeries,
    title: "Visualization/Series/Point & Figure",
};

export const daily = () => <Daily />;
