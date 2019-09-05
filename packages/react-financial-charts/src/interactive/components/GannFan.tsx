import { pairs } from "d3-array";
import { path as d3Path } from "d3-path";
import * as React from "react";

import GenericChartComponent from "../../GenericChartComponent";
import { getMouseCanvas } from "../../GenericComponent";
import { generateLine, isHovering2 } from "./StraightLine";

import {
    hexToRGBA, isDefined,
    isNotDefined, noop,
} from "../../utils";

interface GannFanProps {
    startXY: number[];
    endXY: number[];
    interactiveCursorClass?: string;
    stroke: string;
    strokeWidth: number;
    fill: string[];
    strokeOpacity: number;
    fillOpacity: number;
    fontFamily: string;
    fontSize: number;
    fontFill: string;
    onDragStart: any; // func
    onDrag: any; // func
    onDragComplete: any; // func
    onHover?: any; // func
    onUnHover?: any; // func
    defaultClassName?: string;
    tolerance: number;
    selected: boolean;
}

export class GannFan extends React.Component<GannFanProps> {

    public static defaultProps = {
        onDragStart: noop,
        onDrag: noop,
        onDragComplete: noop,
        strokeWidth: 1,
        tolerance: 4,
        selected: false,
    };

    public render() {
        const { selected, interactiveCursorClass } = this.props;
        const { onDragStart, onDrag, onDragComplete, onHover, onUnHover } = this.props;

        return (
            <GenericChartComponent
                isHover={this.isHover}
                svgDraw={this.renderSVG}
                canvasToDraw={getMouseCanvas}
                canvasDraw={this.drawOnCanvas}
                interactiveCursorClass={interactiveCursorClass}
                selected={selected}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragComplete={onDragComplete}
                onHover={onHover}
                onUnHover={onUnHover}
                drawOn={["mousemove", "mouseleave", "pan", "drag"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { stroke, strokeWidth, fillOpacity, fill, strokeOpacity } = this.props;

        const lines = this.helper(this.props, moreProps);
        const pairsOfLines = pairs(lines);

        return (
            <g>
                {lines.map((each, idx) => {
                    const { x1, y1, x2, y2 } = each;
                    return (
                        <line key={idx}
                            strokeWidth={strokeWidth}
                            stroke={stroke}
                            strokeOpacity={strokeOpacity}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                        />
                    );
                })}
                {pairsOfLines.map(([line1, line2], idx) => {
                    const ctx = d3Path();
                    ctx.moveTo(line1.x1, line1.y1);
                    ctx.lineTo(line1.x2, line1.y2);
                    ctx.lineTo(line2.x2, line2.y2);
                    ctx.closePath();
                    return (
                        <path key={idx}
                            stroke="none"
                            fill={fill[idx]}
                            fillOpacity={fillOpacity}
                            d={ctx.toString()}
                        />
                    );
                })}
            </g>
        );
    }

    private readonly drawOnCanvas = (ctx, moreProps) => {
        const {
            stroke, strokeWidth, strokeOpacity,
            fill, fillOpacity,
            fontFamily, fontSize, fontFill,
        } = this.props;

        const lines = this.helper(this.props, moreProps);

        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = hexToRGBA(stroke, strokeOpacity);

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = fontFill;

        lines.forEach((line) => {
            const {
                x1, y1, x2, y2, label,
            } = line;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillText(label.text, label.x, label.y);
        });
        const pairsOfLines = pairs(lines);

        pairsOfLines.forEach(([line1, line2], idx) => {
            ctx.fillStyle = hexToRGBA(fill[idx], fillOpacity);

            ctx.beginPath();
            ctx.moveTo(line1.x1, line1.y1);
            ctx.lineTo(line1.x2, line1.y2);
            ctx.lineTo(line2.x2, line2.y2);
            ctx.closePath();
            ctx.fill();
        });
    }

    private readonly isHover = (moreProps) => {
        const { tolerance, onHover } = this.props;
        const { mouseXY } = moreProps;
        const [mouseX, mouseY] = mouseXY;

        let hovering = false;
        if (isDefined(onHover)) {

            const lines = this.helper(this.props, moreProps);

            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < lines.length; i++) {
                const line1 = lines[i];

                const left = Math.min(line1.x1, line1.x2);
                const right = Math.max(line1.x1, line1.x2);
                const top = Math.min(line1.y1, line1.y2);
                const bottom = Math.max(line1.y1, line1.y2);

                const isWithinLineBounds = mouseX >= left && mouseX <= right
                    && mouseY >= top && mouseY <= bottom;

                hovering = isWithinLineBounds
                    && isHovering2(
                        [line1.x1, line1.y1],
                        [line1.x2, line1.y2],
                        mouseXY,
                        tolerance);

                if (hovering) { break; }
            }
        }
        return hovering;
    }

    private readonly getLineCoordinates = (start, endX, endY, text) => {
        const end = [
            endX,
            endY,
        ];
        return {
            start, end, text,
        };
    }

    private readonly helper = (props: GannFanProps, moreProps) => {
        const { startXY, endXY } = props;

        const {
            xScale,
            chartConfig: { yScale },
        } = moreProps;
        if (isNotDefined(startXY) || isNotDefined(endXY)) {
            return [];
        }
        const [x1, y1] = startXY;
        const [x2, y2] = endXY;

        const dx = x2 - x1;
        const dy = y2 - y1;

        if (dx !== 0 && dy !== 0) {
            const halfY = this.getLineCoordinates(
                startXY,
                x2,
                y1 + dy / 2,
                "2/1",
            );
            const oneThirdY = this.getLineCoordinates(
                startXY,
                x2,
                y1 + dy / 3,
                "3/1",
            );
            const oneFourthY = this.getLineCoordinates(
                startXY,
                x2,
                y1 + dy / 4,
                "4/1",
            );
            const oneEighthY = this.getLineCoordinates(
                startXY,
                x2,
                y1 + dy / 8,
                "8/1",
            );
            const halfX = this.getLineCoordinates(
                startXY,
                x1 + dx / 2,
                y2,
                "1/2",
            );
            const oneThirdX = this.getLineCoordinates(
                startXY,
                x1 + dx / 3,
                y2,
                "1/3",
            );
            const oneFourthX = this.getLineCoordinates(
                startXY,
                x1 + dx / 4,
                y2,
                "1/4",
            );
            const oneEighthX = this.getLineCoordinates(
                startXY,
                x1 + dx / 8,
                y2,
                "1/8",
            );
            const lines = [
                oneEighthX,
                oneFourthX,
                oneThirdX,
                halfX,
                { start: startXY, end: endXY, text: "1/1" },
                halfY,
                oneThirdY,
                oneFourthY,
                oneEighthY,
            ];
            const lineCoods = lines.map((line) => {
                // tslint:disable-next-line: no-shadowed-variable
                const { x1, y1, x2, y2 } = generateLine({
                    type: "RAY",
                    start: line.start,
                    end: line.end,
                    xScale,
                    yScale,
                });
                return {
                    x1: xScale(x1),
                    y1: yScale(y1),
                    x2: xScale(x2),
                    y2: yScale(y2),
                    label: {
                        x: xScale(line.end[0]),
                        y: yScale(line.end[1]),
                        text: line.text,
                    },
                };
            });
            return lineCoods;
        }
        return [];
    }
}
