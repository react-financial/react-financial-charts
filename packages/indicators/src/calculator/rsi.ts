/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/relativeStrengthIndex.js

The MIT License (MIT)

Copyright (c) 2014-2015 Scott Logic Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { mean } from "d3-array";
import { path, slidingWindow } from "../utils";
import { RSI as defaultOptions } from "./defaultOptionsForComputation";

export interface RSIOptions {
    windowSize: number;
    sourcePath?: string;
}

export default function () {
    let options = defaultOptions;

    const calculator = (data: any[]) => {
        const { windowSize, sourcePath } = options;

        // @ts-ignore
        const source = path(sourcePath);

        let prevAvgGain: any;
        let prevAvgLoss: any;
        const rsiAlgorithm = slidingWindow()
            .windowSize(windowSize)
            .accumulator((values: any[]) => {
                const avgGain =
                    prevAvgGain !== undefined
                        ? (prevAvgGain * (windowSize - 1) + values[values.length - 1].gain) / windowSize
                        : mean<any>(values, (each) => each.gain);

                if (avgGain === undefined) {
                    return undefined;
                }

                const avgLoss =
                    prevAvgLoss !== undefined
                        ? (prevAvgLoss * (windowSize - 1) + values[values.length - 1].loss) / windowSize
                        : mean<any>(values, (each) => each.loss);

                if (avgLoss === undefined) {
                    return undefined;
                }

                const relativeStrength = avgGain / avgLoss;
                const rsi = 100 - 100 / (1 + relativeStrength);

                prevAvgGain = avgGain;
                prevAvgLoss = avgLoss;

                return rsi;
            });

        const gainsAndLossesCalculator = slidingWindow()
            .windowSize(2)
            .undefinedValue(() => [0, 0])
            .accumulator((tuple: any) => {
                const prev = tuple[0];
                const now = tuple[1];
                const change = source(now) - source(prev);
                return {
                    gain: Math.max(change, 0),
                    loss: Math.abs(Math.min(change, 0)),
                };
            });

        const gainsAndLosses = gainsAndLossesCalculator(data);

        const rsiData = rsiAlgorithm(gainsAndLosses);

        return rsiData;
    };

    calculator.undefinedLength = () => {
        const { windowSize } = options;

        return windowSize - 1;
    };

    calculator.options = (newOptions?: RSIOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
