import { rebind } from "../utils/index.js";
import { pointAndFigure } from "../calculator/index.js";
import baseIndicator from "./baseIndicator.js";

const ALGORITHM_TYPE = "PointAndFigure";

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = pointAndFigure();

    const indicator = underlyingAlgorithm;

    rebind(indicator, base, "id", "stroke", "fill", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "dateAccessor", "dateMutator", "options");

    return indicator;
}
