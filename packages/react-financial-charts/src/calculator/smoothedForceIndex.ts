import { zipper } from "../utils";
import { SmoothedForceIndex as defaultOptions } from "./defaultOptionsForComputation";
import ema from "./ema";
import forceIndex from "./forceIndex";
import sma from "./sma";

export default function () {

    const underlyingAlgorithm = forceIndex();
    const merge = zipper()
        .combine((force, smoothed) => {
            return { force, smoothed };
        });

    let options = defaultOptions;
    function calculator(data) {
        const { smoothingType, smoothingWindow } = options;
        const { sourcePath, volumePath } = options;

        const algo = underlyingAlgorithm
            .options({ sourcePath, volumePath });

        // @ts-ignore
        const force = algo(data);

        const ma = smoothingType === "ema" ? ema() : sma();
        const forceMA = ma
            .options({
                windowSize: smoothingWindow,
                sourcePath: undefined,
            });

        // @ts-ignore
        const smoothed = forceMA(force);

        // @ts-ignore
        return merge(force, smoothed);
    }

    calculator.undefinedLength = function () {
        const { smoothingWindow } = options;
        return underlyingAlgorithm.undefinedLength() + smoothingWindow - 1;
    };
    calculator.options = function (x) {
        if (!arguments.length) {
            return options;
        }
        options = { ...defaultOptions, ...x };
        return calculator;
    };

    return calculator;
}
