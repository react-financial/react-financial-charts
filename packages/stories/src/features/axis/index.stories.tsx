import * as React from "react";
import { Axis } from "@react-financial-charts/axes";
import AxisExample from "./axis";

export default {
    component: Axis,
    title: "Features/Axis",
};

export const right = () => <AxisExample />;

export const left = () => <AxisExample axisAt="left" />;
