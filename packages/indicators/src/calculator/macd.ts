/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/macd.js

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
import { zip } from "d3-array";
import { MACD as defaultOptions } from "./defaultOptionsForComputation";
import ema from "./ema";

export interface MACDOptions {
    readonly fast: number;
    readonly slow: number;
    readonly signal: number;
    readonly sourcePath?: string;
}

interface MACDCalculator {
    (data: any[]): {
        macd: number | undefined;
        signal: number | undefined;
        divergence: number | undefined;
    }[];
    undefinedLength(): number;
    options(): MACDOptions;
    options(newOptions: MACDOptions): MACDCalculator;
}

export default function () {
    let options: MACDOptions = defaultOptions;

    const calculator = (data: any[]) => {
        const { fast, slow, signal, sourcePath } = options;

        const fastEMA = ema().options({ windowSize: fast, sourcePath });

        const slowEMA = ema().options({ windowSize: slow, sourcePath });

        const signalEMA = ema().options({ windowSize: signal, sourcePath: undefined });

        const diff = zip(fastEMA(data), slowEMA(data)).map((d) =>
            d[0] !== undefined && d[1] !== undefined ? d[0] - d[1] : undefined,
        );

        const averageDiff = signalEMA(diff);

        return zip(diff, averageDiff).map((d) => ({
            macd: d[0],
            signal: d[1],
            divergence: d[0] !== undefined && d[1] !== undefined ? d[0] - d[1] : undefined,
        }));
    };

    calculator.undefinedLength = () => {
        const { slow, signal } = options;

        return slow + signal - 1;
    };

    calculator.options = (newOptions?: MACDOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator as MACDCalculator;
}
