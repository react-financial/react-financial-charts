/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/elderRay.js

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

import { mean, zip } from "d3-array";
import { slidingWindow } from "../utils";
import ema from "./ema";
import { ElderRay as defaultOptions } from "./defaultOptionsForComputation";

export interface ElderRayOptions {
    readonly movingAverageType: string;
    readonly sourcePath: string;
    readonly windowSize: number;
}

export default function () {
    let options = defaultOptions;
    let ohlc = (d: any) => ({ open: d.open, high: d.high, low: d.low, close: d.close });

    const calculator = (data: any[]) => {
        const { windowSize, sourcePath, movingAverageType } = options;

        const meanAlgorithm =
            movingAverageType === "ema"
                ? ema().options({ windowSize, sourcePath })
                : slidingWindow()
                      .windowSize(windowSize)
                      .accumulator((values: any) => mean(values))
                      .sourcePath(sourcePath);

        return zip(data, meanAlgorithm(data)).map((d) => {
            const datum = d[0];
            const meanValue = d[1];

            const bullPower = meanValue !== undefined ? ohlc(datum).high - meanValue : undefined;
            const bearPower = meanValue !== undefined ? ohlc(datum).low - meanValue : undefined;
            return { bullPower, bearPower };
        });
    };

    calculator.undefinedLength = () => {
        const { windowSize } = options;

        return windowSize - 1;
    };

    calculator.ohlc = (ohlcAccessor?: (d: any) => any) => {
        if (ohlcAccessor === undefined) {
            return ohlc;
        }

        ohlc = ohlcAccessor;

        return calculator;
    };

    calculator.options = (newOptions?: ElderRayOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
