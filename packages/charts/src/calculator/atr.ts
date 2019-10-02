import { sum } from "d3-array";

import { isDefined, last, slidingWindow } from "../utils";

import { ATR as defaultOptions } from "./defaultOptionsForComputation";

export interface ATROptions {
    readonly windowSize: number;
}

export interface ATRSource {
    readonly close: number;
    readonly high: number;
    readonly low: number;
    readonly open: number;
}

export interface ATRCalculator {
    (data: any[]): any;
    undefinedLength(): number;
    options(): ATROptions;
    options(newOptions: ATROptions): ATRCalculator;
    source(): (d: any) => ATRSource;
    source(newSource: ((d: any) => ATRSource)): ATRCalculator;
}

export default function () {

    let options: ATROptions = defaultOptions;
    let source = (d: any) => ({ open: d.open, high: d.high, low: d.low, close: d.close });

    const calculator = (data: any[]) => {
        const { windowSize } = options;

        const trueRangeAlgorithm = slidingWindow()
            .windowSize(2)
            // @ts-ignore
            .source(source)
            .undefinedValue((d) => d.high - d.low) // the first TR value is simply the High minus the Low
            .accumulator((values) => {
                const prev = values[0];
                const d = values[1];
                return Math.max(d.high - d.low,
                    d.high - prev.close,
                    d.low - prev.close);
            });

        let prevATR;

        const atrAlgorithm = slidingWindow()
            .skipInitial(1) // trueRange starts from index 1 so ATR starts from 1
            // @ts-ignore
            .windowSize(windowSize)
            .accumulator((values) => {
                const tr = last(values);
                const atr = isDefined(prevATR)
                    ? ((prevATR * (windowSize - 1)) + tr) / windowSize
                    : sum(values) / windowSize;

                prevATR = atr;
                return atr;
            });

        const newData = atrAlgorithm(trueRangeAlgorithm(data));

        return newData;
    };

    calculator.undefinedLength = () => {
        const { windowSize } = options;

        return windowSize - 1;
    };

    calculator.options = (newOptions?: ATROptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    calculator.source = (newSource?: (d: any) => ATRSource) => {
        if (newSource === undefined) {
            return source;
        }

        source = newSource;

        return calculator;
    };

    return calculator as ATRCalculator;
}
