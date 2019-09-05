/* an extension to d3.zip so we call a function instead of an array */

import { min } from "d3-array";

import identity from "./identity";

export default function zipper() {
    let combine = identity;

    function zip() {
        const n = arguments.length;
        if (!n) { return []; }
        const m = min(arguments, d3_zipLength);

        let i;
        const zips = new Array(m);
        for (i = -1; ++i < m;) {
            // tslint:disable-next-line: no-shadowed-variable
            for (let j = -1, zip = zips[i] = new Array(n); ++j < n;) {
                zip[j] = arguments[j][i];
            }

            // @ts-ignore
            zips[i] = combine.apply(this, zips[i]);
        }
        return zips;
    }
    function d3_zipLength(d) {
        return d.length;
    }
    zip.combine = function (x) {
        if (!arguments.length) {
            return combine;
        }
        combine = x;
        return zip;
    };
    return zip;
}
