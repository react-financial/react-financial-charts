import * as React from "react";
import { RSISeries } from "../../../../series/src/RSISeries";
import RSIIndicator from "./RsiIndicator";

export default {
    title: "Visualization/Indicator/RSI",
    component: RSISeries,
};

export const basic = () => <RSIIndicator />;
