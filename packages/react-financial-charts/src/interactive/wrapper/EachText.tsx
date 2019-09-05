import * as React from "react";

import { noop } from "../../utils";
import { getXValue } from "../../utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";

import { HoverTextNearMouse } from "../components/HoverTextNearMouse";
import { InteractiveText } from "../components/InteractiveText";

interface EachTextProps {
    index?: number;
    position?: any;
    bgFill: string;
    bgOpacity: number;
    bgStrokeWidth: number;
    bgStroke?: string;
    textFill: string;
    fontWeight: string;
    fontFamily: string;
    fontStyle: string;
    fontSize: number;
    text: string;
    selected: boolean;
    onDrag: any; // func
    onDragComplete: any; // func
    hoverText: {
        enable: boolean;
        fontFamily: string;
        fontSize: number;
        fill: string;
        text: string;
        selectedText: string;
        bgFill: string;
        bgOpacity: number;
        bgWidth: number | string;
        bgHeight: number | string;
    };
}

interface EachTextState {
    hover: boolean;
}

export class EachText extends React.Component<EachTextProps, EachTextState> {

    public static defaultProps = {
        onDrag: noop,
        onDragComplete: noop,
        bgOpacity: 1,
        bgStrokeWidth: 1,
        selected: false,
        fill: "#8AAFE2",
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: "auto",
            bgWidth: "auto",
            text: "Click to select object",
        },
    };

    private dragStartPosition;
    // @ts-ignore
    private isHover;
    private saveNodeType;

    constructor(props) {
        super(props);

        this.handleHover = this.handleHover.bind(this);

        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDrag = this.handleDrag.bind(this);

        this.isHover = isHover.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.state = {
            hover: false,
        };
    }

    public render() {
        const {
            position,
            bgFill,
            bgOpacity,
            bgStroke,
            bgStrokeWidth,
            textFill,
            fontFamily,
            fontSize,
            fontWeight,
            fontStyle,
            text,
            hoverText,
            selected,
            onDragComplete,
        } = this.props;
        const { hover } = this.state;

        const hoverHandler = {
            onHover: this.handleHover,
            onUnHover: this.handleHover,
        };

        const {
            enable: hoverTextEnabled,
            selectedText: hoverTextSelected,
            text: hoverTextUnselected,
            ...restHoverTextProps
        } = hoverText;

        return (
            <g>
                <InteractiveText
                    ref={this.saveNodeType("text")}
                    selected={selected || hover}
                    interactiveCursorClass="react-stockcharts-move-cursor"
                    {...hoverHandler}
                    onDragStart={this.handleDragStart}
                    onDrag={this.handleDrag}
                    onDragComplete={onDragComplete}
                    position={position}
                    bgFill={bgFill}
                    bgOpacity={bgOpacity}
                    bgStroke={bgStroke || textFill}
                    bgStrokeWidth={bgStrokeWidth}
                    textFill={textFill}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fontWeight={fontWeight}
                    fontSize={fontSize}
                    text={text}
                />
                <HoverTextNearMouse
                    show={hoverTextEnabled && hover}
                    {...restHoverTextProps}
                    text={selected ? hoverTextSelected : hoverTextUnselected}
                />
            </g>
        );
    }

    private readonly handleHover = (moreProps) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
            });
        }
    }

    private readonly handleDrag = (moreProps) => {
        const { index, onDrag } = this.props;
        const {
            mouseXY: [, mouseY],
            chartConfig: { yScale },
            xAccessor,
            mouseXY,
            plotData,
            xScale,
        } = moreProps;

        const { dx, dy } = this.dragStartPosition;
        const xValue = xScale.invert(
            xScale(getXValue(xScale, xAccessor, mouseXY, plotData)) - dx,
        );
        // xScale.invert(xScale(xAccessor(currentItem)) - dx);
        const xyValue = [
            xValue,
            yScale.invert(mouseY - dy),
        ];

        onDrag(index, xyValue);
    }

    private readonly handleDragStart = (moreProps) => {
        const {
            position,
        } = this.props;
        const { mouseXY } = moreProps;
        const { chartConfig: { yScale }, xScale } = moreProps;
        const [mouseX, mouseY] = mouseXY;

        const [textCX, textCY] = position;
        const dx = mouseX - xScale(textCX);
        const dy = mouseY - yScale(textCY);

        this.dragStartPosition = {
            position, dx, dy,
        };
    }
}
