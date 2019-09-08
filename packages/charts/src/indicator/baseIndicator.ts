import { scaleOrdinal } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";

let i = 0;
const overlayColors = scaleOrdinal<number, string>(schemeCategory10);

export default function () {

    let id = i++;
    let accessor;
    let stroke;
    let fill;
    let echo;
    let type;

    // tslint:disable-next-line: no-empty
    function baseIndicator() {
    }

    baseIndicator.id = function (x) {
        if (!arguments.length) { return id; }
        id = x;
        return baseIndicator;
    };
    baseIndicator.accessor = function (x) {
        if (!arguments.length) { return accessor; }
        accessor = x;
        return baseIndicator;
    };
    baseIndicator.stroke = function (x) {
        if (!arguments.length) { return !stroke ? stroke = overlayColors(id) : stroke; }
        stroke = x;
        return baseIndicator;
    };
    baseIndicator.fill = function (x) {
        if (!arguments.length) { return !fill ? fill = overlayColors(id) : fill; }
        fill = x;
        return baseIndicator;
    };
    baseIndicator.echo = function (x) {
        if (!arguments.length) { return echo; }
        echo = x;
        return baseIndicator;
    };
    baseIndicator.type = function (x) {
        if (!arguments.length) { return type; }
        type = x;
        return baseIndicator;
    };
    return baseIndicator;
}
