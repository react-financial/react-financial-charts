import * as React from "react";
import { VolumeProfileSeries } from "../../../../series/src/VolumeProfileSeries.js";
import VolumeProfile from "./VolumeProfile.js";

export default {
    title: "Visualization/Indicator/Volume Profile",
    component: VolumeProfileSeries,
};

export const basic = () => <VolumeProfile />;
