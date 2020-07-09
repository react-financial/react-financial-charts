import * as React from "react";

export class ToolTipText extends React.PureComponent<React.SVGProps<SVGTextElement>> {
    public static defaultProps = {
        className: "react-financial-charts-tooltip",
        fontFamily: "-apple-system, system-ui, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 11,
    };

    public render() {
        const { children, ...rest } = this.props;

        return <text {...rest}>{children}</text>;
    }
}
