import * as React from "react";
import { HoverTooltip } from "../../../../tooltip/src/HoverTooltip.js";
import Tooltips from "./Tooltips.js";

export default {
    title: "Features/Tooltips",
    component: HoverTooltip,
};

export const hover = () => <Tooltips />;
