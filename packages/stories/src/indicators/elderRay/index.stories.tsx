import * as React from "react";
import { ElderRaySeries } from "../../../../series/src/ElderRaySeries.js";
import ElderRayIndicator from "./ElderRayIndicator.js";

export default {
    title: "Visualization/Indicator/Elder Ray",
    component: ElderRaySeries,
};

export const basic = () => <ElderRayIndicator />;
