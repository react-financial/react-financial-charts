import * as React from "react";
import { Annotate } from "@react-financial-charts/annotations";
import Annotated from "./Annotated";

export default {
    component: Annotate,
    title: "Features/Annotate",
};

export const labels = () => <Annotated labelAnnotation />;

export const paths = () => <Annotated svgAnnotation />;
