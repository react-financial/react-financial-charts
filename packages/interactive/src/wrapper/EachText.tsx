import * as React from "react";
import { getXValue } from "@react-financial-charts/core/lib/utils/ChartDataUtil";
import { isHover, saveNodeType } from "../utils";
import { HoverTextNearMouse, InteractiveText } from "../components";

export interface EachTextProps {
    readonly index?: number;
    readonly position?: any;
    readonly bgFill: string;
    readonly bgStrokeWidth: number;
    readonly bgStroke?: string;
    readonly textFill: string;
    readonly fontWeight: string;
    readonly fontFamily: string;
    readonly fontStyle: string;
    readonly fontSize: number;
    readonly text: string;
    readonly selected: boolean;
    readonly onDrag?: (e: React.MouseEvent, index: number | undefined, xyValue: number[]) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly hoverText: {
        readonly enable: boolean;
        readonly fontFamily: string;
        readonly fontSize: number;
        readonly fill: string;
        readonly text: string;
        readonly selectedText: string;
        readonly bgFill: string;
        readonly bgOpacity: number;
        readonly bgWidth: number | string;
        readonly bgHeight: number | string;
    };
}

interface EachTextState {
    hover: boolean;
}

export class EachText extends React.Component<EachTextProps, EachTextState> {
    public static defaultProps = {
        bgStrokeWidth: 1,
        selected: false,
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: "auto",
            bgWidth: "auto",
            text: "Click to select object",
        },
    };

    private dragStartPosition: any;
    // @ts-ignore
    private isHover: any;
    private saveNodeType: any;

    public constructor(props: EachTextProps) {
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
                    interactiveCursorClass="react-financial-charts-move-cursor"
                    {...hoverHandler}
                    onDragStart={this.handleDragStart}
                    onDrag={this.handleDrag}
                    onDragComplete={onDragComplete}
                    position={position}
                    bgFillStyle={bgFill}
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

    private readonly handleHover = (_: React.MouseEvent, moreProps: any) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
            });
        }
    };

    private readonly handleDrag = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDrag } = this.props;
        if (onDrag === undefined) {
            return;
        }

        const {
            mouseXY: [, mouseY],
            chartConfig: { yScale },
            xAccessor,
            mouseXY,
            plotData,
            xScale,
        } = moreProps;

        const { dx, dy } = this.dragStartPosition;
        const xValue = xScale.invert(xScale(getXValue(xScale, xAccessor, mouseXY, plotData)) - dx);
        // xScale.invert(xScale(xAccessor(currentItem)) - dx);
        const xyValue = [xValue, yScale.invert(mouseY - dy)];

        onDrag(e, index, xyValue);
    };

    private readonly handleDragStart = (_: React.MouseEvent, moreProps: any) => {
        const { position } = this.props;
        const { mouseXY } = moreProps;
        const {
            chartConfig: { yScale },
            xScale,
        } = moreProps;
        const [mouseX, mouseY] = mouseXY;

        const [textCX, textCY] = position;
        const dx = mouseX - xScale(textCX);
        const dy = mouseY - yScale(textCY);

        this.dragStartPosition = {
            position,
            dx,
            dy,
        };
    };
}
