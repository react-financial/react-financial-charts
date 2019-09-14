import * as React from "react";
import { KagiSeries } from "react-financial-charts/lib/series";
import BasicKagiSeries from "./basicKagiSeries";

export default {
    title: "Visualization|Series/Kagi",
    component: KagiSeries,
};

export const basic = () => <BasicKagiSeries />;
