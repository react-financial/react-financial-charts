import { merge, rebind } from "../utils";
import { macd } from "../calculator";
import { MACDOptions } from "../calculator/macd";
import baseIndicator from "./baseIndicator";
import { MACD as appearanceOptions } from "./defaultOptionsForAppearance";

const ALGORITHM_TYPE = "MACD";

interface MACDIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): MACDIndicator;
    accessor(): any;
    accessor(x: any): MACDIndicator;
    stroke(): string | any;
    stroke(x: string | any): MACDIndicator;
    fill(): string | any;
    fill(x: string | any): MACDIndicator;
    echo(): any;
    echo(x: any): MACDIndicator;
    type(): string;
    type(x: string): MACDIndicator;
    merge(): any;
    merge(newMerge: any): MACDIndicator;
    options(): MACDOptions;
    options(newOptions: MACDOptions): MACDIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .fill(appearanceOptions.fill)
        .stroke(appearanceOptions.stroke)
        .accessor((d: any) => d.macd);

    const underlyingAlgorithm = macd();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.macd = i;
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
    rebind(indicator, underlyingAlgorithm, "options", "undefinedLength");
    rebind(indicator, mergedAlgorithm, "merge", "skipUndefined");

    return indicator as MACDIndicator;
}
