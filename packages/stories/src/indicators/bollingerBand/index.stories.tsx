import * as React from "react";
import { BollingerSeries } from "@react-financial-charts/series";
import BollingerIndicator from "./bollingerIndicator";

export default {
    title: "Visualization/Indicator/Bollinger Band",
    component: BollingerSeries,
};

export const basic = () => <BollingerIndicator />;
