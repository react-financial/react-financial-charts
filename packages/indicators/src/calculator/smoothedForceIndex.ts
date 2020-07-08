import { zip } from "d3-array";
import { SmoothedForceIndex as defaultOptions } from "./defaultOptionsForComputation";
import ema from "./ema";
import forceIndex from "./forceIndex";
import sma from "./sma";

export default function () {
    const underlyingAlgorithm = forceIndex();

    let options = defaultOptions;

    const calculator = (data: any[]) => {
        const { smoothingType, smoothingWindow } = options;
        const { sourcePath, volumePath } = options;

        const algo = underlyingAlgorithm.options({ sourcePath, volumePath });

        // @ts-ignore
        const force = algo(data);

        const ma = smoothingType === "ema" ? ema() : sma();
        const forceMA = ma.options({
            windowSize: smoothingWindow,
            sourcePath: undefined,
        });

        // @ts-ignore
        const smoothed = forceMA(force);

        return zip(force, smoothed).map((d) => ({
            force: d[0],
            smoothed: d[1],
        }));
    };

    calculator.undefinedLength = () => {
        const { smoothingWindow } = options;

        return underlyingAlgorithm.undefinedLength() + smoothingWindow - 1;
    };

    calculator.options = (newOptions?: any) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    return calculator;
}
