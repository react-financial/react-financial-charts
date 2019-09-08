/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/bollingerBands.js

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

import { deviation, mean } from "d3-array";

import { last, path, slidingWindow, zipper } from "../utils";
import ema from "./ema";

import { BollingerBand as defaultOptions } from "./defaultOptionsForComputation";

export default function () {
    let options = defaultOptions;

    function calculator(data) {
        const { windowSize, multiplier, movingAverageType, sourcePath } = options;

        // @ts-ignore
        const source = path(sourcePath);

        const meanAlgorithm = movingAverageType === "ema"
            ? ema().options({ windowSize, sourcePath })
            : slidingWindow()
                .windowSize(windowSize)
                // @ts-ignore
                .accumulator((values) => mean(values))
                .sourcePath(sourcePath);

        const bollingerBandAlgorithm = slidingWindow()
            .windowSize(windowSize)
            // @ts-ignore
            .accumulator((values) => {
                const avg = last(values).mean;
                const stdDev = deviation<any>(values, (each) => source(each.datum));
                if (stdDev === undefined) {
                    return undefined;
                }

                return {
                    top: avg + multiplier * stdDev,
                    middle: avg,
                    bottom: avg - multiplier * stdDev,
                };
            });

        const zip = zipper()
            .combine((datum, meanValue) => ({ datum, meanValue }));

        // @ts-ignore
        const tuples = zip(data, meanAlgorithm(data));
        return bollingerBandAlgorithm(tuples);
    }
    calculator.undefinedLength = function () {
        const { windowSize } = options;
        return windowSize - 1;
    };
    calculator.options = function (x) {
        if (!arguments.length) {
            return options;
        }
        options = { ...defaultOptions, ...x };
        return calculator;
    };

    return calculator;
}
