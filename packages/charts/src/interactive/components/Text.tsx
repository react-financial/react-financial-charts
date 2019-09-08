import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";

interface TextProps {
    xyProvider: (moreProps: any) => number[];
    fontFamily: string;
    fontSize: number;
    fill: string;
    children: string;
    selected: boolean;
}

export class Text extends React.Component<TextProps> {

    public static defaultProps = {
        selected: false,
    };

    public render() {
        const { selected } = this.props;

        return (
            <GenericChartComponent
                isHover={this.isHover}
                selected={selected}
                svgDraw={this.renderSVG}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly isHover = () => {
        return false;
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const {
            xyProvider,
            fontFamily,
            fontSize,
            fill,
            children,
        } = this.props;
        const [x, y] = xyProvider(moreProps);

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fill;

        ctx.beginPath();
        ctx.fillText(children, x, y);
    }

    private readonly renderSVG = (moreProps) => {
        const {
            xyProvider,
            fontFamily,
            fontSize,
            fill,
            children,
        } = this.props;
        const [x, y] = xyProvider(moreProps);

        return <text
            x={x}
            y={y}
            fontFamily={fontFamily}
            fontSize={fontSize}
            fill={fill}>{children}</text>;
    }
}
