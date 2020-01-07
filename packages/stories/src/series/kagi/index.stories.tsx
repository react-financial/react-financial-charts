import * as React from "react";
import { KagiSeries } from "react-financial-charts/lib/series";
import { Daily, Intraday } from "./basicKagiSeries";

export default {
    component: KagiSeries,
    title: "Visualization|Series/Kagi",
};

export const daily = () => <Daily />;

export const intraday = () => <Intraday />;
