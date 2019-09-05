import * as PropTypes from "prop-types";
import * as React from "react";

import { isDefined, noop } from "../utils";

import GenericChartComponent from "../GenericChartComponent";
import { getMouseCanvas } from "../GenericComponent";
import { HoverTextNearMouse } from "./components/HoverTextNearMouse";
import {
    getValueFromOverride,
    isHoverForInteractiveType,
    saveNodeType,
    terminate,
} from "./utils";
import { EachText } from "./wrapper/EachText";

interface InteractiveTextProps {
    onChoosePosition: any; // func
    onDragComplete: any; // func
    onSelect?: any; // func
    defaultText: {
        bgFill: string;
        bgOpacity: number;
        bgStrokeWidth?: number;
        bgStroke?: string;
        textFill: string;
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
        fontSize: number;
        text: string;
    };
    hoverText: object;
    textList: any[];
    enabled: boolean;
}

interface InteractiveTextState {
    current?: any;
    override?: any;
}

export class InteractiveText extends React.Component<InteractiveTextProps, InteractiveTextState> {

    public static defaultProps = {
        onChoosePosition: noop,
        onDragComplete: noop,
        onSelect: noop,
        defaultText: {
            bgFill: "#D3D3D3",
            bgOpacity: 1,
            bgStrokeWidth: 1,
            textFill: "#F10040",
            fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
            fontSize: 12,
            fontStyle: "normal",
            fontWeight: "normal",
            text: "Lorem ipsum...",
        },
        hoverText: {
            ...HoverTextNearMouse.defaultProps,
            enable: true,
            bgHeight: "auto",
            bgWidth: "auto",
            text: "Click to select object",
            selectedText: "",
        },
        textList: [],
    };

    public static contextTypes = {
        subscribe: PropTypes.func.isRequired,
        unsubscribe: PropTypes.func.isRequired,
        generateSubscriptionId: PropTypes.func.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    };

    // @ts-ignore
    private getSelectionState;
    private saveNodeType;

    // @ts-ignore
    private terminate;

    constructor(props) {
        super(props);

        this.terminate = terminate.bind(this);

        this.saveNodeType = saveNodeType.bind(this);
        this.getSelectionState = isHoverForInteractiveType("textList")
            .bind(this);

        this.state = {};
    }

    public render() {
        const { textList, defaultText, hoverText } = this.props;
        const { override } = this.state;
        return <g>
            {textList.map((each, idx) => {
                const defaultHoverText = InteractiveText.defaultProps.hoverText;
                const props = {
                    ...defaultText,
                    ...each,
                    hoverText: {
                        ...defaultHoverText,
                        ...hoverText,
                        ...(each.hoverText || {}),
                    },
                };
                return <EachText key={idx}
                    ref={this.saveNodeType(idx)}
                    index={idx}
                    {...props}
                    selected={each.selected}
                    position={getValueFromOverride(override, idx, "position", each.position)}
                    onDrag={this.handleDrag}
                    onDragComplete={this.handleDragComplete}
                    edgeInteractiveCursor="react-stockcharts-move-cursor"
                />;
            })}
            <GenericChartComponent

                onClick={this.handleDraw}

                svgDraw={noop}
                canvasDraw={noop}
                canvasToDraw={getMouseCanvas}

                drawOn={["mousemove", "pan"]}
            />;
        </g>;
    }

    private readonly handleDraw = (moreProps, e) => {
        const { enabled } = this.props;
        if (enabled) {
            const {
                mouseXY: [, mouseY],
                chartConfig: { yScale },
                xAccessor,
                currentItem,
            } = moreProps;

            const xyValue = [xAccessor(currentItem), yScale.invert(mouseY)];

            const { defaultText, onChoosePosition } = this.props;

            const newText = {
                ...defaultText,
                position: xyValue,
            };
            onChoosePosition(newText, moreProps, e);
        }
    }

    private readonly handleDragComplete = (moreProps) => {
        const { override } = this.state;
        if (isDefined(override)) {
            const { textList } = this.props;
            const newTextList = textList
                .map((each, idx) => {
                    const selected = (idx === override.index);
                    return selected
                        ? {
                            ...each,
                            position: override.position,
                            selected,
                        }
                        : {
                            ...each,
                            selected,
                        };
                });
            this.setState({
                override: null,
            }, () => {
                this.props.onDragComplete(newTextList, moreProps);
            });
        }
    }

    private readonly handleDrag = (index, position) => {
        this.setState({
            override: {
                index,
                position,
            },
        });
    }
}
