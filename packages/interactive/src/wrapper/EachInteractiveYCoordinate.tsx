import * as React from "react";
import { strokeDashTypes } from "@react-financial-charts/core";
import { isHover, saveNodeType } from "../utils";
import { ClickableShape, InteractiveYCoordinate } from "../components";

export interface EachInteractiveYCoordinateProps {
    readonly index?: number;
    readonly draggable: boolean;
    readonly yValue: number;
    readonly bgFill: string;
    readonly stroke: string;
    readonly strokeWidth: number;
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
        readonly closeIcon: any;
        readonly left: number;
        readonly height: number;
        readonly padding: any;
    };
    readonly onDrag?: (e: React.MouseEvent, index: number | undefined, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, moreProps: any) => void;
    readonly onDelete?: (e: React.MouseEvent, index: number | undefined, moreProps: any) => void;
}

interface EachInteractiveYCoordinateState {
    closeIconHover: boolean;
    hover: boolean;
}

export class EachInteractiveYCoordinate extends React.Component<
    EachInteractiveYCoordinateProps,
    EachInteractiveYCoordinateState
> {
    public static defaultProps = {
        strokeWidth: 1,
        selected: false,
        draggable: false,
    };

    private dragStartPosition: any;
    // @ts-ignore
    private isHover: any;
    private saveNodeType: any;

    public constructor(props: EachInteractiveYCoordinateProps) {
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
            textFill,
            fontFamily,
            fontSize,
            fontWeight,
            fontStyle,
            text,
            selected,
            onDragComplete,
            stroke,
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
                    bgFillStyle={bgFill}
                    textFill={textFill}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fontWeight={fontWeight}
                    fontSize={fontSize}
                    strokeStyle={stroke}
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
                    strokeStyle={stroke}
                    onHover={this.handleCloseIconHover}
                    onUnHover={this.handleCloseIconHover}
                    onClick={this.handleDelete}
                />
            </g>
        );
    }

    private readonly handleCloseIconHover = (_: React.MouseEvent, moreProps: any) => {
        if (this.state.closeIconHover !== moreProps.hovering) {
            this.setState({
                closeIconHover: moreProps.hovering,
            });
        }
    };

    private readonly handleHover = (e: React.MouseEvent, moreProps: any) => {
        if (this.state.hover !== moreProps.hovering) {
            this.setState({
                hover: moreProps.hovering,
                closeIconHover: moreProps.hovering ? this.state.closeIconHover : false,
            });
        }
    };

    private readonly handleDelete = (e: React.MouseEvent, moreProps: any) => {
        const { index, onDelete } = this.props;
        if (onDelete !== undefined) {
            onDelete(e, index, moreProps);
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
        } = moreProps;

        const { dy } = this.dragStartPosition;

        const newYValue = yScale.invert(mouseY - dy);

        onDrag(e, index, newYValue);
    };

    private readonly handleDragStart = (_: React.MouseEvent, moreProps: any) => {
        const { yValue } = this.props;
        const { mouseXY } = moreProps;
        const {
            chartConfig: { yScale },
        } = moreProps;
        const [, mouseY] = mouseXY;

        const dy = mouseY - yScale(yValue);

        this.dragStartPosition = {
            yValue,
            dy,
        };
    };
}
