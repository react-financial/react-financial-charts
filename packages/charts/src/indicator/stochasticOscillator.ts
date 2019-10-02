import { merge, rebind } from "../utils";

import { sto } from "../calculator";

import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "STO";

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE);

    const underlyingAlgorithm = sto();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum, i) => { datum.sto = i; });

    const indicator = (data: any[], options = { merge: true }) => {
        if (options.merge) {
            if (!base.accessor()) { throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`); }
            return mergedAlgorithm(data);
        }
        return underlyingAlgorithm(data);
    };

    rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options", "undefinedLength");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator;
}
