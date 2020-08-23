import * as React from "react";
import { HoverTooltip } from "../../../../tooltip/src/HoverTooltip";
import Tooltips from "./Tooltips";

export default {
    title: "Features/Tooltips",
    component: HoverTooltip,
};

export const hover = () => <Tooltips />;
