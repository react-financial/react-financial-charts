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
import { path, slidingWindow, zipper } from "../utils";
import ema from "./ema";
import { BollingerBand as defaultOptions } from "./defaultOptionsForComputation";

export interface BollingerBandOptions {
    readonly windowSize: number;
    readonly sourcePath: string;
    readonly multiplier: number;
    readonly movingAverageType: string;
}

interface BollingerBandCalculator {
    (data: any[]): any;
    undefinedLength(): number;
    options(): BollingerBandOptions;
    options(newOptions: BollingerBandOptions): BollingerBandCalculator;
}

export default function () {
    let options: BollingerBandOptions = defaultOptions;

    const calculator = (data: any[]) => {
        const { windowSize, multiplier, movingAverageType, sourcePath } = options;

        const source = path(sourcePath);

        const meanAlgorithm =
            movingAverageType === "ema"
                ? ema().options({ windowSize, sourcePath })
                : slidingWindow()
                      .windowSize(windowSize)
                      .accumulator((values: any) => mean(values))
                      .sourcePath(sourcePath);

        const bollingerBandAlgorithm = slidingWindow()
            .windowSize(windowSize)
            .accumulator((values: any[]) => {
                const avg = values[values.length - 1].mean;
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

        const zip = zipper().combine((datum: any, meanValue: number) => ({ datum, mean: meanValue }));

        const tuples = zip(data, meanAlgorithm(data));

        return bollingerBandAlgorithm(tuples);
    };

    calculator.undefinedLength = () => {
        const { windowSize } = options;

        return windowSize - 1;
    };

    calculator.options = (newOptions?: BollingerBandOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator as BollingerBandCalculator;
}
