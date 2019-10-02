import { merge, rebind } from "../utils";

import { forceIndex } from "../calculator";

import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "ForceIndex";

export default function () {

    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d) => d.forceIndex);

    const underlyingAlgorithm = forceIndex();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum, i) => { datum.forceIndex = i; });

    const indicator = (data: any[], options = { merge: true }) => {
        if (options.merge) {
            if (!base.accessor()) {
                throw new Error(`Set an accessor to ${ALGORITHM_TYPE} before calculating`);
            }

            return mergedAlgorithm(data);
        }
        return underlyingAlgorithm(data);
    };

    rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator;
}
