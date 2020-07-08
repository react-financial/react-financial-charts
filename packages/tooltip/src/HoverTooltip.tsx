import { sum } from "d3-array";
import * as PropTypes from "prop-types";
import * as React from "react";
import { colorToRGBA, first, isDefined, isNotDefined, GenericComponent, last } from "@react-financial-charts/core";

interface HoverTooltipProps {
    readonly chartId?: number | string;
    readonly yAccessor?: any; // func
    readonly tooltipSVG?: any; // func
    readonly backgroundShapeSVG?: any; // func
    readonly bgwidth?: number;
    readonly bgheight?: number;
    readonly bgFill: string;
    readonly bgOpacity: number;
    readonly tooltipContent: any; // func
    readonly origin: number[] | any; // func
    readonly fontFamily?: string;
    readonly fontSize?: number;
}

class HoverTooltip extends React.Component<HoverTooltipProps> {
    public static defaultProps = {
        tooltipSVG: defaultTooltipSVG,
        tooltipCanvas: defaultTooltipCanvas,
        origin: defaultOrigin,
        fill: "#D4E2FD",
        bgFill: "#D4E2FD",
        bgOpacity: 0.5,
        stroke: "#9B9BFF",
        fontFill: "#000000",
        opacity: 0.8,
        backgroundShapeSVG: defaultBackgroundShapeSVG,
        backgroundShapeCanvas: defaultBackgroundShapeCanvas,
        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
        fontSize: 12,
    };

    public static contextTypes = {
        margin: PropTypes.object.isRequired,
        ratio: PropTypes.number.isRequired,
    };

    public render() {
        return (
            <GenericComponent svgDraw={this.renderSVG} canvasDraw={this.drawOnCanvas} drawOn={["mousemove", "pan"]} />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const pointer = helper(this.props, moreProps);

        if (pointer === undefined) {
            return null;
        }

        const { bgFill, bgOpacity, backgroundShapeSVG, tooltipSVG } = this.props;
        const { bgheight, bgwidth } = this.props;
        const { height } = moreProps;

        const { x, y, content, centerX, pointWidth, bgSize } = pointer;

        const bgShape = isDefined(bgwidth) && isDefined(bgheight) ? { width: bgwidth, height: bgheight } : bgSize;

        return (
            <g>
                <rect
                    x={centerX - pointWidth / 2}
                    y={0}
                    width={pointWidth}
                    height={height}
                    fill={bgFill}
                    opacity={bgOpacity}
                />
                <g className="react-financial-charts-tooltip-content" transform={`translate(${x}, ${y})`}>
                    {backgroundShapeSVG(this.props, bgShape)}
                    {tooltipSVG(this.props, content)}
                </g>
            </g>
        );
    };
    private readonly drawOnCanvas = (ctx: CanvasRenderingContext2D, moreProps) => {
        const pointer = helper(this.props, moreProps, ctx);
        const { height } = moreProps;

        if (isNotDefined(pointer)) {
            return null;
        }

        drawOnCanvas(ctx, this.props, this.context, pointer, height);
    };
}

const PADDING = 5;
const X = 10;
const Y = 10;

function defaultBackgroundShapeSVG({ fill, stroke, opacity }, { height, width }) {
    return <rect height={height} width={width} fill={fill} opacity={opacity} stroke={stroke} />;
}

function defaultTooltipSVG({ fontFamily, fontSize, fontFill }, content) {
    const tspans: any[] = [];
    const startY = Y + fontSize * 0.9;

    for (let i = 0; i < content.y.length; i++) {
        const y = content.y[i];
        const textY = startY + fontSize * (i + 1);

        tspans.push(
            <tspan key={`L-${i}`} x={X} y={textY} fill={y.stroke}>
                {y.label}
            </tspan>,
        );
        tspans.push(<tspan key={i}>: </tspan>);
        tspans.push(<tspan key={`V-${i}`}>{y.value}</tspan>);
    }
    return (
        <text fontFamily={fontFamily} fontSize={fontSize} fill={fontFill}>
            <tspan x={X} y={startY}>
                {content.x}
            </tspan>
            {tspans}
        </text>
    );
}

function defaultBackgroundShapeCanvas(props, { width, height }, ctx) {
    const { fill, stroke, opacity } = props;

    ctx.fillStyle = colorToRGBA(fill, opacity);
    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fill();
    ctx.stroke();
}

function defaultTooltipCanvas({ fontFamily, fontSize, fontFill }, content, ctx) {
    const startY = Y + fontSize * 0.9;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontFill;
    ctx.textAlign = "left";
    ctx.fillText(content.x, X, startY);

    for (let i = 0; i < content.y.length; i++) {
        const y = content.y[i];
        const textY = startY + fontSize * (i + 1);
        ctx.fillStyle = y.stroke || fontFill;
        ctx.fillText(y.label, X, textY);

        ctx.fillStyle = fontFill;
        ctx.fillText(": " + y.value, X + ctx.measureText(y.label).width, textY);
    }
}

function drawOnCanvas(ctx: CanvasRenderingContext2D, props, context, pointer, height) {
    const { margin, ratio } = context;
    const { bgFill, bgOpacity } = props;
    const { backgroundShapeCanvas, tooltipCanvas } = props;

    const originX = 0.5 * ratio + margin.left;
    const originY = 0.5 * ratio + margin.top;

    ctx.save();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);

    ctx.translate(originX, originY);

    const { x, y, content, centerX, pointWidth, bgSize } = pointer;

    ctx.fillStyle = colorToRGBA(bgFill, bgOpacity);
    ctx.beginPath();
    ctx.rect(centerX - pointWidth / 2, 0, pointWidth, height);
    ctx.fill();

    ctx.translate(x, y);
    backgroundShapeCanvas(props, bgSize, ctx);
    tooltipCanvas(props, content, ctx);

    ctx.restore();
}

function calculateTooltipSize({ fontFamily, fontSize, fontFill }, content, ctx?) {
    if (isNotDefined(ctx)) {
        const canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
    }

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontFill;
    ctx.textAlign = "left";

    const measureText = (str) => ({
        width: ctx.measureText(str).width,
        height: fontSize,
    });

    const { width, height } = content.y
        .map(({ label, value }) => measureText(`${label}: ${value}`))
        // Sum all y and x sizes (begin with x label size)
        .reduce((res, size) => sumSizes(res, size), measureText(String(content.x)));

    return {
        width: width + 2 * X,
        height: height + 2 * Y,
    };
}

function sumSizes(...sizes) {
    return {
        width: Math.max(...sizes.map((size) => size.width)),
        height: sum(sizes, (d) => d.height),
    };
}

function normalizeX(x, bgSize, pointWidth, width) {
    // return x - bgSize.width - pointWidth / 2 - PADDING * 2 < 0
    return x < width / 2 ? x + pointWidth / 2 + PADDING : x - bgSize.width - pointWidth / 2 - PADDING;
}

function normalizeY(y, bgSize) {
    return y - bgSize.height <= 0 ? y + PADDING : y - bgSize.height - PADDING;
}

function defaultOrigin(props, moreProps, bgSize, pointWidth) {
    const { chartId, yAccessor } = props;
    const { mouseXY, xAccessor, currentItem, xScale, chartConfig, width } = moreProps;

    // @ts-ignore
    let y = last(mouseXY);

    const xValue = xAccessor(currentItem);
    let x = Math.round(xScale(xValue));

    if (isDefined(chartId) && isDefined(yAccessor) && isDefined(chartConfig) && isDefined(chartConfig.findIndex)) {
        const yValue = yAccessor(currentItem);
        const chartIndex = chartConfig.findIndex((c) => c.id === chartId);

        y = Math.round(chartConfig[chartIndex].yScale(yValue));
    }

    x = normalizeX(x, bgSize, pointWidth, width);
    y = normalizeY(y, bgSize);

    return [x, y];
}

function helper(props, moreProps, ctx?) {
    const { show, xScale, currentItem, plotData } = moreProps;
    const { origin, tooltipContent } = props;
    const { xAccessor, displayXAccessor } = moreProps;

    if (!show || isNotDefined(currentItem)) {
        return;
    }

    const xValue = xAccessor(currentItem);

    if (!show || isNotDefined(xValue)) {
        return;
    }

    const content = tooltipContent({ currentItem, xAccessor: displayXAccessor });
    const centerX = xScale(xValue);
    // @ts-ignore
    const pointWidth =
        Math.abs(xScale(xAccessor(last(plotData))) - xScale(xAccessor(first(plotData)))) / (plotData.length - 1);

    const bgSize = calculateTooltipSize(props, content, ctx);

    const [x, y] = origin(props, moreProps, bgSize, pointWidth);

    return { x, y, content, centerX, pointWidth, bgSize };
}

export default HoverTooltip;
