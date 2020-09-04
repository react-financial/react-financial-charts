/* an extension to d3.zip so we call a function instead of an array */

import { min } from "d3-array";
import { identity } from "./identity";

interface Zip {
    (...args: any[]): any[];
    combine(): any;
    combine(x: any): Zip;
}

export default function zipper() {
    let combine = identity;

    function zip() {
        const n = arguments.length;
        if (n === 0) {
            return [];
        }
        const m = min(arguments, d3_zipLength) ?? 0;

        const zips = new Array(m);
        for (let i = -1; ++i < m; ) {
            // tslint:disable-next-line: no-shadowed-variable
            for (let j = -1, zip = (zips[i] = new Array(n)); ++j < n; ) {
                zip[j] = arguments[j][i];
            }

            // @ts-ignore
            zips[i] = combine.apply(this, zips[i]);
        }
        return zips;
    }
    function d3_zipLength(d: any[]) {
        return d.length;
    }
    zip.combine = function (x: any) {
        if (!arguments.length) {
            return combine;
        }
        combine = x;
        return zip;
    };
    return zip as Zip;
}
