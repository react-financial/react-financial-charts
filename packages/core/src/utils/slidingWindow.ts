/*

Taken from https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/slidingWindow.js

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

import { functor, path } from "./index";
import { noop } from "./noop";

interface SlidingWindow {
    (data: any[]): any[];
    misc(): any;
    misc(x: any): SlidingWindow;
    accumulator(): any;
    accumulator(x: any): SlidingWindow;
    skipInitial(): number;
    skipInitial(x: number): SlidingWindow;
    source(): any;
    source(source: any): SlidingWindow;
    sourcePath(): any;
    sourcePath(x: any): SlidingWindow;
    windowSize(): number;
    windowSize(windowSize: number): SlidingWindow;
    undefinedValue(): any;
    undefinedValue(x: any): SlidingWindow;
}

export default function () {
    let undefinedValue: any;
    let windowSize = 10;
    let accumulator = noop;
    let sourcePath: any;
    let source: any;
    let skipInitial = 0;
    let misc: any;

    const slidingWindow = (data: any[]) => {
        const sourceFunction = source || path(sourcePath);

        // @ts-ignore
        const size = functor(windowSize).apply(this, arguments);
        const windowData = data.slice(skipInitial, size + skipInitial).map(sourceFunction);

        let accumulatorIdx = 0;
        const undef = functor(undefinedValue);
        return data.map((d, i) => {
            if (i < skipInitial + size - 1) {
                return undef(sourceFunction(d), i, misc);
            }
            if (i >= skipInitial + size) {
                // Treat windowData as FIFO rolling buffer
                windowData.shift();
                windowData.push(sourceFunction(d, i));
            }

            // @ts-ignore
            return accumulator(windowData, i, accumulatorIdx++, misc);
        });
    };

    slidingWindow.undefinedValue = function (x: any) {
        if (!arguments.length) {
            return undefinedValue;
        }
        undefinedValue = x;
        return slidingWindow;
    };

    slidingWindow.windowSize = function (x: any) {
        if (!arguments.length) {
            return windowSize;
        }
        windowSize = x;
        return slidingWindow;
    };

    slidingWindow.misc = function (x: any) {
        if (!arguments.length) {
            return misc;
        }
        misc = x;
        return slidingWindow;
    };

    slidingWindow.accumulator = function (x: any) {
        if (!arguments.length) {
            return accumulator;
        }
        accumulator = x;
        return slidingWindow;
    };

    slidingWindow.skipInitial = function (x: any) {
        if (!arguments.length) {
            return skipInitial;
        }
        skipInitial = x;
        return slidingWindow;
    };

    slidingWindow.sourcePath = function (x: any) {
        if (!arguments.length) {
            return sourcePath;
        }
        sourcePath = x;
        return slidingWindow;
    };

    slidingWindow.source = function (x: any) {
        if (!arguments.length) {
            return source;
        }
        source = x;
        return slidingWindow;
    };

    return slidingWindow as SlidingWindow;
}
