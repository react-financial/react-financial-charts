import * as React from "react";
import { BollingerSeries } from "react-financial-charts/lib/series";
import BollingerIndicator from "./bollingerIndicator";

export default {
    component: BollingerSeries,
    title: "Visualization|Indicator/Bollinger Band",
};

export const basic = () => <BollingerIndicator />;
