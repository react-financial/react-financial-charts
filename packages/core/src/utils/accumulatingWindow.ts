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

import { identity } from "./identity";
import { functor } from "./index";
import { noop } from "./noop";

interface AccumulatingWindow {
    (data: any[]): any[];
    accumulateTill(): any;
    accumulateTill(x: any): AccumulatingWindow;
    accumulator(): any;
    accumulator(x: any): AccumulatingWindow;
    value(): any;
    value(x: any): AccumulatingWindow;
    discardTillStart(): boolean;
    discardTillStart(x: boolean): AccumulatingWindow;
    discardTillEnd(): boolean;
    discardTillEnd(x: boolean): AccumulatingWindow;
}

export default function () {
    let accumulateTill = functor(false);
    let accumulator = noop;
    let value = identity;
    let discardTillStart = false;
    let discardTillEnd = false;

    const accumulatingWindow = function (data: any[]) {
        let accumulatedWindow: any[] | undefined = discardTillStart ? undefined : [];
        const response: any[] = [];
        let accumulatorIdx = 0;
        let i = 0;
        for (i = 0; i < data.length; i++) {
            const d = data[i];
            if (accumulateTill(d, i, accumulatedWindow || [])) {
                if (accumulatedWindow && accumulatedWindow.length > 0) {
                    // @ts-ignore
                    response.push(accumulator(accumulatedWindow, i, accumulatorIdx++));
                }

                accumulatedWindow = [value(d)];
            } else if (accumulatedWindow) {
                accumulatedWindow.push(value(d));
            }
        }

        if (!discardTillEnd) {
            // @ts-ignore
            response.push(accumulator(accumulatedWindow, i, accumulatorIdx));
        }

        return response;
    };

    accumulatingWindow.accumulateTill = function (x: any) {
        if (!arguments.length) {
            return accumulateTill;
        }
        accumulateTill = functor(x);
        return accumulatingWindow;
    };
    accumulatingWindow.accumulator = function (x: any) {
        if (!arguments.length) {
            return accumulator;
        }
        accumulator = x;
        return accumulatingWindow;
    };
    accumulatingWindow.value = function (x: any) {
        if (!arguments.length) {
            return value;
        }
        value = x;
        return accumulatingWindow;
    };
    accumulatingWindow.discardTillStart = function (x: any) {
        if (!arguments.length) {
            return discardTillStart;
        }
        discardTillStart = x;
        return accumulatingWindow;
    };
    accumulatingWindow.discardTillEnd = function (x: any) {
        if (!arguments.length) {
            return discardTillEnd;
        }
        discardTillEnd = x;
        return accumulatingWindow;
    };

    return accumulatingWindow as AccumulatingWindow;
}
