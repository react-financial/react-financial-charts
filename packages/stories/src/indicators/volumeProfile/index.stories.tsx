import * as React from "react";
import { VolumeProfileSeries } from "../../../../series/src/VolumeProfileSeries";
import VolumeProfile from "./VolumeProfile";

export default {
    title: "Visualization/Indicator/Volume Profile",
    component: VolumeProfileSeries,
};

export const basic = () => <VolumeProfile />;
