import * as React from "react";
import { GenericChartComponent } from "@react-financial-charts/core";

export class SVGComponent extends React.Component {
    public render() {
        const { children } = this.props;
        return <GenericChartComponent drawOn={[]} svgDraw={children} />;
    }
}
