import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";

export class SVGComponent extends React.Component {
    public render() {
        const { children } = this.props;
        return (
            <GenericChartComponent
                drawOn={[]}
                svgDraw={children}
            />
        );
    }
}
