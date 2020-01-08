import * as React from "react";
import { default as Axis } from "react-financial-charts/lib/axes/Axis";
import AxisExample from "./axis";

export default {
    component: Axis,
    title: "Features|Axis",
};

export const right = () => <AxisExample />;

export const left = () => <AxisExample axisAt="left" />;
