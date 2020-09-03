import { merge, rebind } from "../utils";
import { bollingerband } from "../calculator";
import { BollingerBandOptions } from "../calculator/bollingerband";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "BollingerBand";

interface BollingerBandIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): BollingerBandIndicator;
    accessor(): any;
    accessor(x: any): BollingerBandIndicator;
    stroke(): string | any;
    stroke(x: string | any): BollingerBandIndicator;
    fill(): string | any;
    fill(x: string | any): BollingerBandIndicator;
    echo(): any;
    echo(x: any): BollingerBandIndicator;
    type(): string;
    type(x: string): BollingerBandIndicator;
    merge(): any;
    merge(newMerge: any): BollingerBandIndicator;
    options(): BollingerBandOptions;
    options(newOptions: BollingerBandOptions): BollingerBandIndicator;
}

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = bollingerband();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.bollingerBand = i;
        });

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

    return indicator as BollingerBandIndicator;
}
