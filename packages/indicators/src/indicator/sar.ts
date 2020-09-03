import { merge, rebind } from "../utils";
import { sar } from "../calculator";
import { SAROptions } from "../calculator/sar";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "SMA";

interface SARIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): SARIndicator;
    accessor(): any;
    accessor(x: any): SARIndicator;
    stroke(): string | any;
    stroke(x: string | any): SARIndicator;
    fill(): string | any;
    fill(x: string | any): SARIndicator;
    echo(): any;
    echo(x: any): SARIndicator;
    type(): string;
    type(x: string): SARIndicator;
    merge(): any;
    merge(newMerge: any): SARIndicator;
    options(): SAROptions;
    options(newOptions: SAROptions): SARIndicator;
}

export default function () {
    const base = baseIndicator()
        .type(ALGORITHM_TYPE)
        .accessor((d: any) => d.sar);

    const underlyingAlgorithm = sar();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: number) => {
            datum.sar = i;
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

    rebind(indicator, base, "id", "accessor", "stroke", "echo", "type");
    rebind(indicator, underlyingAlgorithm, "options", "undefinedLength");
    rebind(indicator, mergedAlgorithm, "merge");

    return indicator as SARIndicator;
}
