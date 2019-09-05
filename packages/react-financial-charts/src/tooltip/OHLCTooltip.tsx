
import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import * as React from "react";
import GenericChartComponent from "../GenericChartComponent";
import { default as defaultDisplayValuesFor } from "./displayValuesFor";

import { functor, isDefined } from "../utils";
import { ToolTipText } from "./ToolTipText";
import { ToolTipTSpanLabel } from "./ToolTipTSpanLabel";

const displayTextsDefault = {
    d: "Date: ",
    o: " O: ",
    h: " H: ",
    l: " L: ",
    c: " C: ",
    v: " Vol: ",
    na: "n/a",
};

const defaultDisplay = (props, _, itemsToDisplay) => {

    const {
        className,
        textFill,
        labelFill,
        onClick,
        fontFamily,
        fontSize,
        displayTexts,
    } = props;

    const {
        displayDate,
        open,
        high,
        low,
        close,
        volume,
        x,
        y,
    } = itemsToDisplay;

    return (
        <g
            className={`react-stockcharts-tooltip-hover ${className}`}
            transform={`translate(${x}, ${y})`}
            onClick={onClick}>
            <ToolTipText
                x={0}
                y={0}
                fontFamily={fontFamily}
                fontSize={fontSize}>
                <ToolTipTSpanLabel
                    fill={labelFill}
                    key="label"
                    x={0}
                    dy="5">
                    {displayTexts.d}
                </ToolTipTSpanLabel>
                <tspan key="value" fill={textFill}>{displayDate}</tspan>
                <ToolTipTSpanLabel fill={labelFill} key="label_O">{displayTexts.o}</ToolTipTSpanLabel>
                <tspan key="value_O" fill={textFill}>{open}</tspan>
                <ToolTipTSpanLabel fill={labelFill} key="label_H">{displayTexts.h}</ToolTipTSpanLabel>
                <tspan key="value_H" fill={textFill}>{high}</tspan>
                <ToolTipTSpanLabel fill={labelFill} key="label_L">{displayTexts.l}</ToolTipTSpanLabel>
                <tspan key="value_L" fill={textFill}>{low}</tspan>
                <ToolTipTSpanLabel fill={labelFill} key="label_C">{displayTexts.c}</ToolTipTSpanLabel>
                <tspan key="value_C" fill={textFill}>{close}</tspan>
                <ToolTipTSpanLabel fill={labelFill} key="label_Vol">{displayTexts.v}</ToolTipTSpanLabel>
                <tspan key="value_Vol" fill={textFill}>{volume}</tspan>
            </ToolTipText>
        </g>
    );
};

interface OHLCTooltipProps {
    className?: string;
    accessor?: any; // func
    xDisplayFormat?: any; // func
    children?: any; // func
    volumeFormat?: any; // func
    percentFormat?: any; // func
    ohlcFormat?: any; // func
    origin?: number[] | any; // func
    fontFamily?: string;
    fontSize?: number;
    onClick?: ((event: React.MouseEvent<SVGGElement, MouseEvent>) => void);
    displayValuesFor?: any; // func
    textFill?: string;
    labelFill?: string;
    displayTexts?: any;
}

export class OHLCTooltip extends React.Component<OHLCTooltipProps> {

    public static defaultProps = {
        accessor: (d) => {
            return {
                date: d.date,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
                volume: d.volume,
            };
        },
        xDisplayFormat: timeFormat("%Y-%m-%d"),
        volumeFormat: format(".4s"),
        percentFormat: format(".2%"),
        ohlcFormat: format(".2f"),
        displayValuesFor: defaultDisplayValuesFor,
        origin: [0, 0],
        children: defaultDisplay,
        displayTexts: displayTextsDefault,
    };

    public render() {
        return (
            <GenericChartComponent
                clip={false}
                svgDraw={this.renderSVG}
                drawOn={["mousemove"]}
            />
        );
    }

    private readonly renderSVG = (moreProps) => {
        const { displayValuesFor } = this.props;
        const {
            xDisplayFormat,
            accessor,
            volumeFormat,
            ohlcFormat,
            percentFormat,
            displayTexts,
        } = this.props;

        const { chartConfig: { width, height } } = moreProps;
        const { displayXAccessor } = moreProps;

        const currentItem = displayValuesFor(this.props, moreProps);

        let displayDate;
        let open;
        let high;
        let low;
        let close;
        let volume;
        let percent;
        displayDate = open = high = low = close = volume = percent = displayTexts.na;

        if (isDefined(currentItem) && isDefined(accessor(currentItem))) {
            const item = accessor(currentItem);
            volume = isDefined(item.volume) ? volumeFormat(item.volume) : displayTexts.na;

            displayDate = xDisplayFormat(displayXAccessor(item));
            open = ohlcFormat(item.open);
            high = ohlcFormat(item.high);
            low = ohlcFormat(item.low);
            close = ohlcFormat(item.close);
            percent = percentFormat((item.close - item.open) / item.open);
        }

        const { origin: originProp } = this.props;
        const origin = functor(originProp);
        const [x, y] = origin(width, height);

        const itemsToDisplay = {
            displayDate,
            open,
            high,
            low,
            close,
            percent,
            volume,
            x,
            y,
        };
        return this.props.children(this.props, moreProps, itemsToDisplay);
    }
}
