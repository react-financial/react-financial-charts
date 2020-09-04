/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/exponentialMovingAverage.js

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

import { path } from "../utils";
import { EMA as defaultOptions } from "./defaultOptionsForComputation";

export interface EMAOptions {
    readonly windowSize: number;
    readonly sourcePath?: string;
}

interface EMACalculator {
    (data: any[]): (number | undefined)[];
    undefinedLength(): number;
    options(): EMAOptions;
    options(newOptions: EMAOptions): EMACalculator;
}

export default function () {
    let options: EMAOptions = defaultOptions;

    const calculator = (data: any[]) => {
        const { windowSize, sourcePath } = options;

        const source = path(sourcePath);
        const alpha = 2 / (windowSize + 1);
        let previous: any;
        let initialAccumulator = 0;
        let skip = 0;

        return data.map(function (d, i) {
            const v = source(d, i);
            if (previous === undefined && v === undefined) {
                skip++;
                return undefined;
            } else if (i < windowSize + skip - 1) {
                initialAccumulator += v;
                return undefined;
            } else if (i === windowSize + skip - 1) {
                initialAccumulator += v;
                const initialValue = initialAccumulator / windowSize;
                previous = initialValue;
                return initialValue;
            } else {
                const nextValue = v * alpha + (1 - alpha) * previous;
                previous = nextValue;
                return nextValue;
            }
        });
    };

    calculator.undefinedLength = () => {
        const { windowSize } = options;

        return windowSize - 1;
    };

    calculator.options = (newOptions?: EMAOptions) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator as EMACalculator;
}
