import * as React from "react";

import { noop, strokeDashTypes } from "../../utils";
import { isHover, saveNodeType } from "../utils";

import { ClickableShape } from "../components/ClickableShape";
import { InteractiveYCoordinate } from "../components/InteractiveYCoordinate";

interface EachInteractiveYCoordinateProps {
    readonly index?: number;
    readonly draggable: boolean;
    readonly yValue: number;
    readonly bgFill: string;
    readonly bgOpacity: number;
    readonly stroke: string;
    readonly strokeWidth: number;
    readonly strokeOpacity: number;
    readonly strokeDasharray: strokeDashTypes;
    readonly textFill: string;
    readonly fontWeight: string;
    readonly fontFamily: string;
    readonly fontStyle: string;
    readonly fontSize: number;
    readonly text: string;
    readonly selected: boolean;
    readonly edge: object;
    readonly textBox: {
        closeIcon: any;
        left: number;
        padding: any;
    };
    readonly onDrag: any; // func
    readonly onDragComplete: any; // func
    readonly onDelete: any; // func
}

interface EachInteractiveYCoordinateState {
    closeIconHover: boolean;
    hover: boolean;
}

export class EachInteractiveYCoordinate extends React.Component<EachInteractiveYCoordinateProps, EachInteractiveYCoordinateState> {

    public static defaultProps = {
        onDrag: noop,
        onDragComplete: noop,
        strokeWidth: 1,
        opacity: 1,
        selected: false,
        fill: "#FFFFFF",
        draggable: false,
    };

    private dragStartPosition;
    // @ts-ignore
    private isHover;
    private saveNodeType;

    public constructor(props) {
        super(props);

        this.isHover = isHover.bind(this);
        this.saveNodeType = saveNodeType.bind(this);

        this.state = {
            hover: false,
            closeIconHover: false,
        };
    }

    public render() {
        const {
            yValue,
            bgFill,
            bgOpacity,
            textFill,
            fontFamily,
            fontSize,
            fontWeight,
            fontStyle,
            text,
            // hoverText,
            selected,
            onDragComplete,
            stroke,
            strokeOpacity,
            strokeDasharray,
            strokeWidth,
            edge,
            textBox,
            draggable,
        } = this.props;

        const { hover, closeIconHover } = this.state;

        const hoverHandler = {
            onHover: this.handleHover,
            onUnHover: this.handleHover,
        };

        const dragProps = draggable
            ? {
                onDragStart: this.handleDragStart,
                onDrag: this.handleDrag,
                onDragComplete,
            }
            : {};
        return (
            <g>
                <InteractiveYCoordinate
                    ref={this.saveNodeType("priceCoordinate")}
                    selected={selected && !closeIconHover}
                    hovering={hover || closeIconHover}
                    interactiveCursorClass="react-financial-charts-move-cursor"
                    {...hoverHandler}
                    {...dragProps}
                    yValue={yValue}
                    bgFill={bgFill}
                    bgOpacity={bgOpacity}
                    textFill={textFill}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fontWeight={fontWeight}
                    fontSize={fontSize}
                    stroke={stroke}
                    strokeOpacity={strokeOpacity}
                    strokeDasharray={strokeDasharray}
                    strokeWidth={strokeWidth}
                    text={text}
                    textBox={textBox}
                    edge={edge}
                />
                <ClickableShape
                    show
                    hovering={closeIconHover}
                    text={text}
                    yValue={yValue}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fontWeight={fontWeight}
                    fontSize={fontSize}
                    textBox={textBox}
                    stroke={stroke}
                    strokeOpacity={strokeOpacity}
                    onHover={this.handleCloseIconHover}
                    onUnHover={this.handleCloseIconHover}
                    onClick={this.handleDelete}
                />
            </g>
        );
    }

    private readonly handleCloseIconHover = (moreProps) => {
        if (this.state.closeIconHover !== moreProps.hovering) {
            this.setState({
                closeIconHover: moreProps.hovering,
            });
        }
    }

    private readonly handleHover = (moreProps) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
                closeIconHover: moreProps.hovering ? this.state.closeIconHover : false,
            });
        }
    }

    private readonly handleDelete = (moreProps) => {
        const { index, onDelete } = this.props;
        onDelete(index, moreProps);
    }

    private readonly handleDrag = (moreProps) => {
        const { index, onDrag } = this.props;
        const {
            mouseXY: [, mouseY],
            chartConfig: { yScale },
        } = moreProps;

        const { dy } = this.dragStartPosition;

        const newYValue = yScale.invert(mouseY - dy);

        onDrag(index, newYValue);
    }

    private readonly handleDragStart = (moreProps) => {
        const {
            yValue,
        } = this.props;
        const { mouseXY } = moreProps;
        const { chartConfig: { yScale } } = moreProps;
        const [, mouseY] = mouseXY;

        const dy = mouseY - yScale(yValue);

        this.dragStartPosition = {
            yValue, dy,
        };
    }
}
