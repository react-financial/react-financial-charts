import * as React from "react";
import { RSISeries } from "../../../../series/src/RSISeries.js";
import RSIIndicator from "./RsiIndicator.js";

export default {
    title: "Visualization/Indicator/RSI",
    component: RSISeries,
};

export const basic = () => <RSIIndicator />;
