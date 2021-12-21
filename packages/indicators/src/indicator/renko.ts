import { rebind } from "../utils/index.js";
import { renko } from "../calculator/index.js";
import baseIndicator from "./baseIndicator.js";

const ALGORITHM_TYPE = "Renko";

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = renko();

    const indicator = underlyingAlgorithm;

    rebind(indicator, base, "id", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options", "dateAccessor", "dateMutator");

    return indicator;
}
