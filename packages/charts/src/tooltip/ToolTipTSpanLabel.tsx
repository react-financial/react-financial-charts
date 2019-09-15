import * as React from "react";

interface ToolTipTSpanLabelProps extends React.SVGProps<SVGTSpanElement> {
}

export class ToolTipTSpanLabel extends React.Component<ToolTipTSpanLabelProps> {

    public static defaultProps = {
        className: "react-financial-charts-tooltip-label",
        fill: "#4682B4",
    };

    public render() {

        const { children, ...rest } = this.props;

        return (
            <tspan {...rest}>
                {children}
            </tspan>
        );
    }
}
