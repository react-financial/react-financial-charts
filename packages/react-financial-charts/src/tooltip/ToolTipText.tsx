import * as React from "react";

interface ToolTipTextProps extends React.SVGProps<SVGTextElement> {
}

export class ToolTipText extends React.Component<ToolTipTextProps> {

    public static defaultProps = {
        className: "react-stockcharts-tooltip",
        fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
        fontSize: 11,
    };

    public render() {

        const { children, fontFamily, fontSize, ...rest } = this.props;

        return (
            <text
                fontFamily={fontFamily}
                fontSize={fontSize}
                {...rest}>
                {children}
            </text>
        );
    }
}
