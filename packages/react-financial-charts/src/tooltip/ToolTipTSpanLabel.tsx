import * as React from "react";

interface ToolTipTSpanLabelProps extends React.SVGProps<SVGTSpanElement> {
    readonly fill: string | undefined;
}

export class ToolTipTSpanLabel extends React.Component<ToolTipTSpanLabelProps> {

    public static defaultProps = {
        className: "react-stockcharts-tooltip-label",
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
