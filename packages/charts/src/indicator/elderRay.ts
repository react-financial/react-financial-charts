import { elderRay } from "../calculator";
import { merge, rebind } from "../utils";

import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "ElderRay";

export default function () {

    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d) => d.elderRay);

    const underlyingAlgorithm = elderRay();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        // @ts-ignore
        .merge((datum, i) => { datum.elderRay = i; });

    const indicator = function (data, options = { merge: true }) {
        if (options.merge) {
            if (!base.accessor()) { throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`); }
            return mergedAlgorithm(data);
        }
        return underlyingAlgorithm(data);
    };

    rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator;
}
