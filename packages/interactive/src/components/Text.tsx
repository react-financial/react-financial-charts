import * as React from "react";
import { getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";

interface TextProps {
    readonly children: string;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fill: string;
    readonly selected?: boolean;
    readonly xyProvider: (moreProps: any) => number[];
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
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private readonly isHover = () => {
        return false;
    };

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const { xyProvider, fontFamily, fontSize, fill, children } = this.props;
        const [x, y] = xyProvider(moreProps);

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fill;

        ctx.beginPath();
        ctx.fillText(children, x, y);
    };
}
