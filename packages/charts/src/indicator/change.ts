import { change } from "../calculator";
import { merge, rebind } from "../utils";

import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "Change";

export default function () {

    const base = baseIndicator()
        .type(ALGORITHM_TYPE);

    const underlyingAlgorithm = change();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum, i) => {
            datum.absoluteChange = i.absoluteChange;
            datum.percentChange = i.percentChange;
        });

    const indicator = (data: any[], options = { merge: true }) => {
        if (options.merge) {
            return mergedAlgorithm(data);
        }
        return underlyingAlgorithm(data);
    };
    rebind(indicator, base, "id", "accessor", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator;
}
