/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/merge.js

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
import zipper from "./zipper";
import { identity } from "./identity";

interface Merge {
    (data: any[]): any;
    algorithm(): any;
    algorithm(newAlgorithm: any): Merge;
    merge(): any;
    merge(newMerge: any): Merge;
    skipUndefined(): boolean;
    skipUndefined(newSkipUndefined: boolean): Merge;
}

// applies an algorithm to an array, merging the result back into
// the source array using the given merge function.
export default function () {
    let algorithm = identity;
    let skipUndefined = true;
    let merge = () => {
        /** Do Nothing */
    };

    const mergeCompute = (data: any[]) => {
        const zip = zipper().combine((datum: any, indicator: any) => {
            const result =
                skipUndefined && indicator === undefined
                    ? datum
                    : // @ts-ignore
                      merge(datum, indicator);
            return result === undefined ? datum : result;
        });

        // @ts-ignore
        return zip(data, algorithm(data));
    };

    mergeCompute.algorithm = (newAlgorithm?: any) => {
        if (newAlgorithm === undefined) {
            return algorithm;
        }

        algorithm = newAlgorithm;

        return mergeCompute;
    };

    mergeCompute.merge = (newMerge?: any) => {
        if (newMerge === undefined) {
            return merge;
        }

        merge = newMerge;

        return mergeCompute;
    };

    mergeCompute.skipUndefined = (newSkipUndefined?: boolean) => {
        if (newSkipUndefined === undefined) {
            return skipUndefined;
        }

        skipUndefined = newSkipUndefined;

        return mergeCompute;
    };

    return mergeCompute as Merge;
}
