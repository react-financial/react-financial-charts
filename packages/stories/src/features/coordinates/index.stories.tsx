import * as React from "react";
import { MouseCoordinateY } from "react-financial-charts/lib/coordinates";
import Coordinates from "./coordinates";

export default {
    component: MouseCoordinateY,
    title: "Features|Coordinates",
};

export const edge = () => <Coordinates />;

export const arrows = () => <Coordinates arrowWidth={10} />;
