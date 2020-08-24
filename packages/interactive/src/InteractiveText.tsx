import * as PropTypes from "prop-types";
import * as React from "react";
import { isDefined, noop, getMouseCanvas, GenericChartComponent } from "@react-financial-charts/core";
import { HoverTextNearMouse } from "./components/HoverTextNearMouse";
import { getValueFromOverride, isHoverForInteractiveType, saveNodeType, terminate } from "./utils";
import { EachText } from "./wrapper/EachText";

interface InteractiveTextProps {
    readonly onChoosePosition: (e: React.MouseEvent, newText: any, moreProps: any) => void;
    readonly onDragComplete?: (e: React.MouseEvent, newTextList: any[], moreProps: any) => void;
    readonly onSelect?: any; // func
    readonly defaultText: {
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
    readonly hoverText: object;
    readonly textList: any[];
    readonly enabled: boolean;
}

interface InteractiveTextState {
    current?: any;
    override?: any;
}

export class InteractiveText extends React.Component<InteractiveTextProps, InteractiveTextState> {
    public static defaultProps = {
        onSelect: noop,
        defaultText: {
            bgFill: "#D3D3D3",
            bgOpacity: 1,
            bgStrokeWidth: 1,
            textFill: "#F10040",
            fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
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

    public constructor(props) {
        super(props);

        this.terminate = terminate.bind(this);
        this.saveNodeType = saveNodeType.bind(this);
        this.getSelectionState = isHoverForInteractiveType("textList").bind(this);

        this.state = {};
    }

    public render() {
        const { textList, defaultText, hoverText } = this.props;
        const { override } = this.state;
        return (
            <g>
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
                    return (
                        <EachText
                            key={idx}
                            ref={this.saveNodeType(idx)}
                            index={idx}
                            {...props}
                            selected={each.selected}
                            position={getValueFromOverride(override, idx, "position", each.position)}
                            onDrag={this.handleDrag}
                            onDragComplete={this.handleDragComplete}
                            edgeInteractiveCursor="react-financial-charts-move-cursor"
                        />
                    );
                })}
                <GenericChartComponent
                    onClick={this.handleDraw}
                    canvasToDraw={getMouseCanvas}
                    drawOn={["mousemove", "pan"]}
                />
                ;
            </g>
        );
    }

    private readonly handleDraw = (e: React.MouseEvent, moreProps: any) => {
        const { enabled } = this.props;
        if (enabled) {
            const {
                mouseXY: [, mouseY],
                chartConfig: { yScale },
                xAccessor,
                currentItem,
            } = moreProps;

            const { defaultText, onChoosePosition } = this.props;

            if (onChoosePosition !== undefined) {
                const xyValue = [xAccessor(currentItem), yScale.invert(mouseY)];
                const newText = {
                    ...defaultText,
                    position: xyValue,
                };
                onChoosePosition(e, newText, moreProps);
            }
        }
    };

    private readonly handleDragComplete = (e: React.MouseEvent, moreProps: any) => {
        const { override } = this.state;
        if (isDefined(override)) {
            const { textList } = this.props;
            const newTextList = textList.map((each, idx) => {
                const selected = idx === override.index;
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
            this.setState(
                {
                    override: null,
                },
                () => {
                    const { onDragComplete } = this.props;
                    if (onDragComplete !== undefined) {
                        onDragComplete(e, newTextList, moreProps);
                    }
                },
            );
        }
    };

    private readonly handleDrag = (_: React.MouseEvent, index, position) => {
        this.setState({
            override: {
                index,
                position,
            },
        });
    };
}
