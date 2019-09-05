import * as PropTypes from "prop-types";
import * as React from "react";
import GenericComponent, { getMouseCanvas } from "../GenericComponent";

import {
    first,
    getStrokeDasharray,
    hexToRGBA,
    isNotDefined,
    last,
    strokeDashTypes,
} from "../utils";

interface CursorProps {
    className?: string;
    stroke?: string;
    strokeDasharray?: strokeDashTypes;
    snapX?: boolean;
    opacity?: number;
    disableYCursor?: boolean;
    useXCursorShape?: boolean;
    xCursorShapeFill?: string | any; // func
    xCursorShapeStroke: string | any; // func
    xCursorShapeStrokeDasharray?: strokeDashTypes;
    xCursorShapeOpacity?: number;
}

const defaultCustomSnapX = (props: CursorProps, moreProps) => {
    const { xScale, xAccessor, currentItem, mouseXY } = moreProps;
    const { snapX } = props;
    const x = snapX ? Math.round(xScale(xAccessor(currentItem))) : mouseXY[0];
    return x;
};

class Cursor extends React.Component<CursorProps> {

    public static defaultProps = {
        stroke: "#000000",
        opacity: 0.3,
        strokeDasharray: "ShortDash",
        snapX: true,
        customSnapX: defaultCustomSnapX,
        disableYCursor: false,
        useXCursorShape: false,
        xCursorShapeStroke: "#000000",
        xCursorShapeOpacity: 0.5,
    };

    public static contextTypes = {
        margin: PropTypes.object.isRequired,
        ratio: PropTypes.number.isRequired,
        // xScale for getting update event upon pan end, this is needed to get past the PureComponent shouldComponentUpdate
        // xScale: PropTypes.func.isRequired,
    };

    public render() {
        return (
            <GenericComponent
                svgDraw={this.renderSVG}
                clip={false}
                canvasDraw={this.drawOnCanvas}
                canvasToDraw={getMouseCanvas}
                drawOn={["mousemove", "pan", "drag"]}
            />
        );
    }

    private getXCursorShapeStroke(moreProps) {
        const { xCursorShapeStroke } = this.props;
        const { currentItem } = moreProps;
        return xCursorShapeStroke instanceof Function
            ? xCursorShapeStroke(currentItem)
            : xCursorShapeStroke;
    }

    private getXCursorShapeFill(moreProps) {
        const { xCursorShapeFill } = this.props;
        const { currentItem } = moreProps;
        return xCursorShapeFill instanceof Function
            ? xCursorShapeFill(currentItem)
            : xCursorShapeFill;
    }

    private getXCursorShape(moreProps/* , ctx */) {
        const { height, xScale, currentItem, plotData } = moreProps;
        const { xAccessor } = moreProps;
        const xValue = xAccessor(currentItem);
        const centerX = xScale(xValue);
        const shapeWidth =
            Math.abs(
                xScale(xAccessor(last(plotData))) -
                xScale(xAccessor(first(plotData))),
            ) / (plotData.length - 1);
        const xPos = centerX - shapeWidth / 2;

        return { height, xPos, shapeWidth };
    }

    private getXYCursor(props, moreProps) {
        const { mouseXY, currentItem, show, height, width } = moreProps;
        const {
            customSnapX,
            stroke,
            opacity,
            strokeDasharray,
            disableYCursor,
        } = props;

        if (!show || isNotDefined(currentItem)) {
            return undefined;
        }

        const yCursor = {
            x1: 0,
            x2: width,
            y1: mouseXY[1],
            y2: mouseXY[1],
            stroke,
            strokeDasharray,
            opacity,
            id: "yCursor",
        };
        const x = customSnapX(props, moreProps);

        const xCursor = {
            x1: x,
            x2: x,
            y1: 0,
            y2: height,
            stroke,
            strokeDasharray,
            opacity,
            id: "xCursor",
        };

        return disableYCursor ? [xCursor] : [yCursor, xCursor];
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const cursors = this.getXYCursor(this.props, moreProps);

        if (cursors !== undefined) {
            const { useXCursorShape } = this.props;

            const { margin, ratio } = this.context;
            const originX = 0.5 * ratio + margin.left;
            const originY = 0.5 * ratio + margin.top;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(ratio, ratio);

            ctx.translate(originX, originY);

            cursors.forEach((line) => {
                const dashArray = getStrokeDasharray(line.strokeDasharray)
                    .split(",")
                    .map((d) => +d);
                const xShapeFill = this.getXCursorShapeFill(moreProps);

                if (useXCursorShape && line.id === "xCursor") {
                    const {
                        xCursorShapeOpacity,
                        xCursorShapeStrokeDasharray,
                    } = this.props;
                    const xShape = this.getXCursorShape(moreProps);

                    if (xCursorShapeStrokeDasharray != null) {
                        const xShapeStroke = this.getXCursorShapeStroke(
                            moreProps,
                        );
                        ctx.strokeStyle = hexToRGBA(
                            xShapeStroke,
                            xCursorShapeOpacity,
                        );
                        ctx.setLineDash(
                            getStrokeDasharray(xCursorShapeStrokeDasharray)
                                .split(",")
                                .map((d) => +d),
                        );
                    }

                    ctx.beginPath();
                    ctx.fillStyle =
                        xShapeFill != null
                            ? hexToRGBA(xShapeFill, xCursorShapeOpacity)
                            : "rgba(0, 0, 0, 0)"; // ="transparent"

                    ctx.beginPath();
                    xCursorShapeStrokeDasharray == null
                        ? ctx.fillRect(
                            xShape.xPos,
                            0,
                            xShape.shapeWidth,
                            xShape.height,
                        )
                        : ctx.rect(
                            xShape.xPos,
                            0,
                            xShape.shapeWidth,
                            xShape.height,
                        );
                    ctx.fill();
                } else {
                    ctx.strokeStyle = hexToRGBA(line.stroke, line.opacity);
                    ctx.setLineDash(dashArray);
                    ctx.beginPath();
                    ctx.moveTo(line.x1, line.y1);
                    ctx.lineTo(line.x2, line.y2);
                }

                ctx.stroke();
            });

            ctx.restore();
        }
    }

    private readonly renderSVG = (moreProps) => {
        const cursors = this.getXYCursor(this.props, moreProps);
        if (cursors === undefined) {
            return null;
        }

        const { className, useXCursorShape } = this.props;

        return (
            <g className={`react-stockcharts-crosshair ${className}`}>
                {cursors.map(({ strokeDasharray, id, ...rest }, idx) => {
                    if (useXCursorShape && id === "xCursor") {
                        const {
                            xCursorShapeOpacity,
                            xCursorShapeStrokeDasharray,
                        } = this.props;
                        const xShape = this.getXCursorShape(moreProps);
                        const xShapeFill = this.getXCursorShapeFill(moreProps);
                        const xShapeStroke = this.getXCursorShapeStroke(
                            moreProps,
                        );
                        return (
                            <rect
                                key={idx}
                                x={xShape.xPos}
                                y={0}
                                width={xShape.shapeWidth}
                                height={xShape.height}
                                fill={
                                    xShapeFill != null
                                        ? xShapeFill
                                        : "none"
                                }
                                stroke={
                                    xCursorShapeStrokeDasharray == null
                                        ? null
                                        : xShapeStroke
                                }
                                strokeDasharray={
                                    xCursorShapeStrokeDasharray == null
                                        ? undefined
                                        : getStrokeDasharray(
                                            xCursorShapeStrokeDasharray,
                                        )
                                }
                                opacity={xCursorShapeOpacity}
                            />
                        );
                    }

                    return (
                        <line
                            key={idx}
                            strokeDasharray={getStrokeDasharray(
                                strokeDasharray,
                            )}
                            {...rest}
                        />
                    );
                })}
            </g>
        );
    }
}

export default Cursor;
