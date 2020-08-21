import * as React from "react";
import {
    lastVisibleItemBasedZoomAnchor,
    mouseBasedZoomAnchor,
    rightDomainBasedZoomAnchor,
} from "@react-financial-charts/core";
import { ChartCanvas } from "../../../../core/src/ChartCanvas";
import Interaction from "./Interaction";

export default {
    component: ChartCanvas,
    title: "Features/Interaction",
};

export const clamp = () => <Interaction clamp />;

export const disable = () => <Interaction disableInteraction />;

export const disablePan = () => <Interaction disablePan />;

export const disableZoom = () => <Interaction disableZoom />;

export const zoomAnchorToMouse = () => <Interaction zoomAnchor={mouseBasedZoomAnchor} />;

export const zoomAnchorToLastVisible = () => <Interaction zoomAnchor={lastVisibleItemBasedZoomAnchor} />;

export const zoomAnchorToBounds = () => <Interaction zoomAnchor={rightDomainBasedZoomAnchor} />;
