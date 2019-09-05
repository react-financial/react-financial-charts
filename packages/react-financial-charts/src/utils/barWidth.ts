import { head } from ".";

/**
 * Bar width is based on the amount of items in the plot data and the distance between the first and last of those
 * items.
 * @param props the props passed to the series.
 * @param moreProps an object holding the xScale, xAccessor and plotData.
 * @return {number} the bar width.
 */
export const plotDataLengthBarWidth = (props: { widthRatio: number }, moreProps: { xScale: any; }): number => {
    const { widthRatio } = props;
    const { xScale } = moreProps;

    const [l, r] = xScale.range();

    const totalWidth = Math.abs(r - l);
    if (xScale.invert != null) {
        const [dl, dr] = xScale.domain();
        const width = totalWidth / Math.abs(dl - dr);
        return width * widthRatio;
    } else {
        const width = totalWidth / xScale.domain().length;
        return width * widthRatio;
    }
};

/**
 * Generates a width function that calculates the bar width based on the given time interval.
 * @param interval a d3-time time interval.
 * @return {Function} the width function.
 */
export const timeIntervalBarWidth = (interval) => {
    return function (props: { widthRatio: number }, moreProps: { xScale: any; xAccessor: any; plotData: any }) {
        const { widthRatio } = props;
        const { xScale, xAccessor, plotData } = moreProps;

        const first = xAccessor(head(plotData));
        return Math.abs(xScale(interval.offset(first, 1)) - xScale(first)) * widthRatio;
    };
};
