import { head, isDefined, last } from "@react-financial-charts/core";
import { ascending } from "d3-array";
import { scaleLinear, InterpolatorFactory } from "d3-scale";
import { levelDefinition } from "./levels";

const MAX_LEVEL = levelDefinition.length - 1;

export default function financeDiscontinuousScale(index: any[], backingLinearScale = scaleLinear()) {
    if (index === undefined) {
        throw new Error("Use the discontinuousTimeScaleProvider to create financeDiscontinuousScale");
    }

    function scale(x: number) {
        return backingLinearScale(x);
    }
    scale.invert = function (x: number) {
        const inverted = backingLinearScale.invert(x);
        return Math.round(inverted * 10000) / 10000;
    };
    scale.domain = function (domain: number[]) {
        if (!arguments.length) {
            return backingLinearScale.domain();
        }
        backingLinearScale.domain(domain);
        return scale;
    };
    scale.range = function (range: number[]) {
        if (!arguments.length) {
            return backingLinearScale.range();
        }
        backingLinearScale.range(range);
        return scale;
    };
    scale.rangeRound = function (range: number[]) {
        return backingLinearScale.range(range);
    };
    scale.clamp = function (clamp: boolean) {
        if (!arguments.length) {
            return backingLinearScale.clamp();
        }
        backingLinearScale.clamp(clamp);
        return scale;
    };
    scale.interpolate = function (interpolate: InterpolatorFactory<number, number>) {
        if (!arguments.length) {
            return backingLinearScale.interpolate();
        }
        backingLinearScale.interpolate(interpolate);
        return scale;
    };
    scale.ticks = function (m?: number) {
        const backingTicks = backingLinearScale.ticks(m);
        const ticksMap = new Map<number, any[]>();

        const [domainStart, domainEnd] = backingLinearScale.domain();

        const dStart = Math.ceil(domainStart);
        const dHead = head(index)?.index;
        const start = Math.max(dStart, dHead) + Math.abs(dHead);
        const end = Math.min(Math.floor(domainEnd), last(index)?.index) + Math.abs(dHead);

        const desiredTickCount = Math.ceil(((end - start) / (domainEnd - domainStart)) * backingTicks.length);

        for (let i = MAX_LEVEL; i >= 0; i--) {
            const ticksAtLevel = ticksMap.get(i);
            const temp = ticksAtLevel === undefined ? [] : ticksAtLevel.slice();

            for (let j = start; j <= end; j++) {
                if (index[j].level === i) {
                    temp.push(index[j]);
                }
            }

            ticksMap.set(i, temp);
        }

        let unsortedTicks: number[] = [];
        for (let k = MAX_LEVEL; k >= 0; k--) {
            const selectedTicks = ticksMap.get(k) ?? [];
            if (selectedTicks.length + unsortedTicks.length > desiredTickCount * 1.5) {
                break;
            }
            unsortedTicks = unsortedTicks.concat(selectedTicks.map((d) => d.index));
        }

        const ticks = unsortedTicks.sort(ascending);

        if (end - start > ticks.length) {
            const ticksSet = new Set(ticks);

            const d = Math.abs(head(index).index);

            // ignore ticks within this distance
            const distance = Math.ceil(
                (backingTicks.length > 0 ? (last(backingTicks) - head(backingTicks)) / backingTicks.length / 4 : 1) *
                    1.5,
            );

            for (let i = 0; i < ticks.length - 1; i++) {
                for (let j = i + 1; j < ticks.length; j++) {
                    if (ticks[j] - ticks[i] <= distance) {
                        ticksSet.delete(index[ticks[i] + d].level >= index[ticks[j] + d].level ? ticks[j] : ticks[i]);
                    }
                }
            }

            // @ts-ignore
            const tickValues = [...ticksSet.values()].map((i) => parseInt(i, 10));

            return tickValues;
        }

        return ticks;
    };
    scale.tickFormat = function () {
        return function (x: any) {
            const d = Math.abs(head(index).index);
            const { format, date } = index[Math.floor(x + d)];
            return format(date);
        };
    };
    scale.value = function (x: any) {
        const d = Math.abs(head(index).index);
        const row = index[Math.floor(x + d)];
        if (isDefined(row)) {
            const { date } = row;
            return date;
        }
    };
    scale.nice = function (count?: number) {
        backingLinearScale.nice(count);
        return scale;
    };
    scale.index = function (x: any) {
        if (!arguments.length) {
            return index;
        }
        index = x;
        return scale;
    };
    scale.copy = function () {
        return financeDiscontinuousScale(index, backingLinearScale.copy());
    };
    return scale;
}
