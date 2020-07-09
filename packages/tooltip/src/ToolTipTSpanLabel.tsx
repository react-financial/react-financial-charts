import * as React from "react";

export class ToolTipTSpanLabel extends React.PureComponent<React.SVGProps<SVGTSpanElement>> {
    public static defaultProps = {
        className: "react-financial-charts-tooltip-label",
        fill: "#4682B4",
    };

    public render() {
        const { children, ...rest } = this.props;

        return <tspan {...rest}>{children}</tspan>;
    }
}
