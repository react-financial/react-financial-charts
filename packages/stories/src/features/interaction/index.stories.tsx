import * as React from "react";
import { ChartCanvas } from "react-financial-charts";
import { lastVisibleItemBasedZoomAnchor, mouseBasedZoomAnchor, rightDomainBasedZoomAnchor } from "react-financial-charts/lib/utils/zoomBehavior";
import Interaction from "./interaction";

export default {
    title: "Features|Interaction",
    component: ChartCanvas,
};

export const clamp = () => <Interaction clamp />;

export const disable = () => <Interaction disableInteraction />;

export const disablePan = () => <Interaction disablePan />;

export const disableZoom = () => <Interaction disableZoom />;

export const zoomAnchorToMouse = () => <Interaction zoomAnchor={mouseBasedZoomAnchor} />;

export const zoomAnchorToLastVisible = () => <Interaction zoomAnchor={lastVisibleItemBasedZoomAnchor} />;

export const zoomAnchorToBounds = () => <Interaction zoomAnchor={rightDomainBasedZoomAnchor} />;
