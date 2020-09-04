import * as React from "react";

import { getStrokeDasharray, getStrokeDasharrayCanvas, isDefined } from "@react-financial-charts/core";

export const renderSVG = (props: any) => {
    const { className } = props;

    const edge = helper(props);
    if (edge === null) {
        return null;
    }

    let line;
    let coordinateBase;
    let coordinate;

    if (edge.line !== undefined) {
        line = (
            <line
                className="react-financial-charts-cross-hair"
                stroke={edge.line.stroke}
                strokeDasharray={getStrokeDasharray(edge.line.strokeDasharray)}
                x1={edge.line.x1}
                y1={edge.line.y1}
                x2={edge.line.x2}
                y2={edge.line.y2}
            />
        );
    }
    if (edge.coordinate !== undefined && edge.coordinateBase !== undefined) {
        const { rectWidth, rectHeight, arrowWidth } = edge.coordinateBase;

        const path =
            edge.orient === "left"
                ? `M0,0L0,${rectHeight}L${rectWidth},${rectHeight}L${rectWidth + arrowWidth},10L${rectWidth},0L0,0L0,0`
                : `M0,${arrowWidth}L${arrowWidth},${rectHeight}L${rectWidth + arrowWidth},${rectHeight}L${
                      rectWidth + arrowWidth
                  },0L${arrowWidth},0L0,${arrowWidth}`;

        coordinateBase =
            edge.orient === "left" || edge.orient === "right" ? (
                <g key={1} transform={`translate(${edge.coordinateBase.edgeXRect},${edge.coordinateBase.edgeYRect})`}>
                    <path
                        d={path}
                        className="react-financial-charts-text-background"
                        height={rectHeight}
                        width={rectWidth}
                        stroke={edge.coordinateBase.stroke}
                        strokeLinejoin="miter"
                        strokeWidth={edge.coordinateBase.strokeWidth}
                        fill={edge.coordinateBase.fill}
                    />
                </g>
            ) : (
                <rect
                    key={1}
                    className="react-financial-charts-text-background"
                    x={edge.coordinateBase.edgeXRect}
                    y={edge.coordinateBase.edgeYRect}
                    height={rectHeight}
                    width={rectWidth}
                    fill={edge.coordinateBase.fill}
                />
            );

        coordinate = (
            <text
                key={2}
                x={edge.coordinate.edgeXText}
                y={edge.coordinate.edgeYText}
                textAnchor={edge.coordinate.textAnchor}
                fontFamily={edge.coordinate.fontFamily}
                fontSize={edge.coordinate.fontSize}
                dy=".32em"
                fill={edge.coordinate.textFill}
            >
                {edge.coordinate.displayCoordinate}
            </text>
        );
    }
    return (
        <g className={className}>
            {line}
            {coordinateBase}
            {coordinate}
        </g>
    );
};

const helper = (props: any) => {
    const {
        coordinate: displayCoordinate,
        show,
        type,
        orient,
        edgeAt,
        hideLine,
        lineStrokeDasharray,
        fill,
        fontFamily,
        fontSize,
        textFill,
        lineStroke,
        stroke,
        strokeWidth,
        arrowWidth,
        rectWidth,
        rectHeight,
        rectRadius,
        x1,
        y1,
        x2,
        y2,
        dx,
    } = props;

    if (!show) {
        return null;
    }

    let coordinateBase;
    let coordinate;
    if (displayCoordinate !== undefined) {
        const textAnchor = "middle";

        let edgeXRect;
        let edgeYRect;
        let edgeXText;
        let edgeYText;

        if (type === "horizontal") {
            edgeXRect = dx + (orient === "right" ? edgeAt + 1 : edgeAt - rectWidth - 1);
            edgeYRect = y1 - rectHeight / 2 - strokeWidth;
            edgeXText = dx + (orient === "right" ? edgeAt + rectWidth / 2 : edgeAt - rectWidth / 2);
            edgeYText = y1;
        } else {
            const dy = orient === "bottom" ? strokeWidth - 1 : -strokeWidth + 1;
            edgeXRect = x1 - rectWidth / 2;
            edgeYRect = (orient === "bottom" ? edgeAt : edgeAt - rectHeight) + dy;
            edgeXText = x1;
            edgeYText = (orient === "bottom" ? edgeAt + rectHeight / 2 : edgeAt - rectHeight / 2) + dy;
        }

        coordinateBase = {
            edgeXRect,
            edgeYRect,
            rectHeight: rectHeight + strokeWidth,
            rectWidth,
            rectRadius,
            fill,
            arrowWidth,
            stroke,
            strokeWidth,
        };
        coordinate = {
            edgeXText,
            edgeYText,
            textAnchor,
            fontFamily,
            fontSize,
            textFill,
            displayCoordinate,
        };
    }

    const line = hideLine
        ? undefined
        : {
              stroke: lineStroke,
              strokeDasharray: lineStrokeDasharray,
              x1,
              y1,
              x2,
              y2,
          };

    return {
        coordinateBase,
        coordinate,
        line,
        orient,
    };
};

export const drawOnCanvas = (ctx: CanvasRenderingContext2D, props: any) => {
    const { coordinate, fitToText, fontSize, fontFamily, rectWidth } = props;

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";

    let width = rectWidth;
    if (fitToText) {
        width = Math.round(ctx.measureText(coordinate).width + 10);
    }

    const edge = helper({ ...props, rectWidth: width });
    if (edge === null) {
        return;
    }

    if (edge.line !== undefined && isDefined(edge.line)) {
        const dashArray = getStrokeDasharrayCanvas(edge.line.strokeDasharray);
        ctx.setLineDash(dashArray);
        ctx.strokeStyle = edge.line.stroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(edge.line.x1, edge.line.y1);
        ctx.lineTo(edge.line.x2, edge.line.y2);
        ctx.stroke();
    }

    ctx.setLineDash([]);

    if (edge.coordinateBase !== undefined) {
        const { arrowWidth, rectWidth, rectHeight, rectRadius } = edge.coordinateBase;

        ctx.fillStyle = edge.coordinateBase.fill;
        if (edge.coordinateBase.stroke !== undefined) {
            ctx.strokeStyle = edge.coordinateBase.stroke;
            ctx.lineWidth = edge.coordinateBase.strokeWidth;
        }

        let x = edge.coordinateBase.edgeXRect;
        const y = edge.coordinateBase.edgeYRect;
        const halfHeight = rectHeight / 2;

        ctx.beginPath();

        if (arrowWidth > 0 && edge.orient === "right") {
            x -= arrowWidth;
            ctx.moveTo(x, y + halfHeight);
            ctx.lineTo(x + arrowWidth, y);
            ctx.lineTo(x + rectWidth + arrowWidth, y);
            ctx.lineTo(x + rectWidth + arrowWidth, y + rectHeight);
            ctx.lineTo(x + arrowWidth, y + rectHeight);
            ctx.closePath();
        } else if (arrowWidth > 0 && edge.orient === "left") {
            ctx.moveTo(x, y);
            ctx.lineTo(x + rectWidth, y);
            ctx.lineTo(x + rectWidth + arrowWidth, y + halfHeight);
            ctx.lineTo(x + rectWidth, y + rectHeight);
            ctx.lineTo(x, y + rectHeight);
            ctx.closePath();
        } else if (rectRadius) {
            roundRect(ctx, x - 0.5, y - 0.5, rectWidth, rectHeight, 3);
        } else {
            ctx.rect(x - 0.5, y, rectWidth, rectHeight);
        }

        ctx.fill();

        if (edge.coordinateBase.stroke !== undefined) {
            ctx.stroke();
        }

        if (edge.coordinate !== undefined) {
            ctx.fillStyle = edge.coordinate.textFill;
            ctx.textAlign =
                edge.coordinate.textAnchor === "middle" ? "center" : (edge.coordinate.textAnchor as CanvasTextAlign);
            ctx.fillText(edge.coordinate.displayCoordinate, edge.coordinate.edgeXText, edge.coordinate.edgeYText);
        }
    }
};

const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};
