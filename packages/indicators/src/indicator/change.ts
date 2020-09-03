import { change } from "../calculator";
import { merge, rebind } from "../utils";
import { ChangeOptions } from "../calculator/change";
import baseIndicator from "./baseIndicator";

const ALGORITHM_TYPE = "Change";

interface ChangeIndicator {
    (data: any[], options?: { merge: boolean }): any;
    id(): number;
    id(x: number): ChangeIndicator;
    accessor(): any;
    accessor(x: any): ChangeIndicator;
    stroke(): string | any;
    stroke(x: string | any): ChangeIndicator;
    fill(): string | any;
    fill(x: string | any): ChangeIndicator;
    echo(): any;
    echo(x: any): ChangeIndicator;
    type(): string;
    type(x: string): ChangeIndicator;
    merge(): any;
    merge(newMerge: any): ChangeIndicator;
    options(): ChangeOptions;
    options(newOptions: ChangeOptions): ChangeIndicator;
}

export default function () {
    const base = baseIndicator().type(ALGORITHM_TYPE);

    const underlyingAlgorithm = change();

    const mergedAlgorithm = merge()
        .algorithm(underlyingAlgorithm)
        .merge((datum: any, i: any) => {
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

    return indicator as ChangeIndicator;
}
