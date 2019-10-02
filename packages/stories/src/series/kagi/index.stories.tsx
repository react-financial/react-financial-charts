import * as React from "react";
import { KagiSeries } from "react-financial-charts/lib/series";
import BasicKagiSeries from "./basicKagiSeries";

export default {
    component: KagiSeries,
    title: "Visualization|Series/Kagi",
};

export const basic = () => <BasicKagiSeries />;
