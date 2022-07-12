import { GenericComponent, functor, ChartCanvasContext } from "@react-financial-charts/core";
import { ScaleContinuousNumeric } from "d3-scale";
import * as React from "react";

export interface LabelProps {
    readonly datum?: any;
    readonly fillStyle?: string | ((datum: any) => string);
    readonly fontFamily?: string;
    readonly fontSize?: number;
    readonly fontWeight?: string;
    readonly rotate?: number;
    readonly selectCanvas?: (canvases: any) => any;
    readonly text?: string | ((datum: any) => string);
    readonly textAlign?: CanvasTextAlign;
    readonly x:
        | number
        | ((xScale: ScaleContinuousNumeric<number, number>, xAccessor: any, datum: any, plotData: any[]) => number);
    readonly xAccessor?: (datum: any) => any;
    readonly xScale?: ScaleContinuousNumeric<number, number>;
    readonly y: number | ((yScale: ScaleContinuousNumeric<number, number>, datum: any, plotData: any[]) => number);
    readonly yScale?: ScaleContinuousNumeric<number, number>;
}

export class Label extends React.Component<LabelProps> {
    public static defaultProps = {
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 64,
        fontWeight: "bold",
        fillStyle: "#dcdcdc",
        rotate: 0,
        x: ({ xScale, xAccessor, datum }: any) => xScale(xAccessor(datum)),
        selectCanvas: (canvases: any) => canvases.bg,
    };

    public static contextType = ChartCanvasContext;

    public render() {
        const { selectCanvas } = this.props;

        return <GenericComponent canvasToDraw={selectCanvas} canvasDraw={this.drawOnCanvas} drawOn={[]} />;
    }

    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps: any) => {
        ctx.save();

        const { textAlign = "center", fontFamily, fontSize, fontWeight, rotate } = this.props;

        const { canvasOriginX, canvasOriginY, margin, ratio } = this.context;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);

        if (canvasOriginX !== undefined) {
            ctx.translate(canvasOriginX, canvasOriginY);
        } else {
            ctx.translate(margin.left + 0.5 * ratio, margin.top + 0.5 * ratio);
        }

        const { xScale, chartConfig, xAccessor } = moreProps;

        const yScale = Array.isArray(chartConfig) || !chartConfig ? undefined : chartConfig.yScale;

        const { xPos, yPos, fillStyle, text } = this.helper(moreProps, xAccessor, xScale, yScale);

        ctx.save();
        ctx.translate(xPos, yPos);
        if (rotate !== undefined) {
            const radians = (rotate / 180) * Math.PI;

            ctx.rotate(radians);
        }

        if (fontFamily !== undefined) {
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        }
        if (fillStyle !== undefined) {
            ctx.fillStyle = fillStyle;
        }
        if (textAlign !== undefined) {
            ctx.textAlign = textAlign;
        }

        ctx.beginPath();
        ctx.fillText(text, 0, 0);
        ctx.restore();
    };

    private readonly helper = (
        moreProps: any,
        xAccessor: any,
        xScale: ScaleContinuousNumeric<number, number>,
        yScale: ScaleContinuousNumeric<number, number>,
    ) => {
        const { x, y, datum, fillStyle, text } = this.props;

        const { plotData } = moreProps;

        const xFunc = functor(x);
        const yFunc = functor(y);

        const [xPos, yPos] = [xFunc({ xScale, xAccessor, datum, plotData }), yFunc({ yScale, datum, plotData })];

        return {
            xPos,
            yPos,
            text: functor(text)(datum),
            fillStyle: functor(fillStyle)(datum),
        };
    };
}
