
import { functor, isNotDefined, merge } from "../utils";

import atr from "./atr";

import { Renko as defaultOptions } from "./defaultOptionsForComputation";

export default function () {
    let options = defaultOptions;

    let dateAccessor = (d) => d.date;
    let dateMutator = (d, date) => { d.date = date; };

    function calculator(rawData) {
        const { reversalType, fixedBrickSize, sourcePath, windowSize } = options;

        const source = sourcePath === "high/low"
            ? (d) => ({ high: d.high, low: d.low })
            : (d) => ({ high: d.close, low: d.close });

        const pricingMethod = source;
        let brickSize;

        if (reversalType === "ATR") {
            // calculateATR(rawData, period);
            const atrAlgorithm = atr().options({ windowSize });

            const atrCalculator = merge()
                .algorithm(atrAlgorithm)
                // @ts-ignore
                .merge((d, c) => { d["atr" + windowSize] = c; });

            atrCalculator(rawData);
            brickSize = (d) => d["atr" + windowSize];
        } else {
            brickSize = functor(fixedBrickSize);
        }

        const renkoData: any[] = [];

        let index = 0;
        let prevBrickClose = rawData[index].open;
        let prevBrickOpen = rawData[index].open;
        let brick: {
            added?: any;
            date?: any;
            direction?: any;
            from?: any;
            fromDate?: any;
            to?: any;
            toDate?: any;
            open?: number;
            high?: number;
            low?: number;
            close?: number;
            fullyFormed?: any;
            current?: any;
            changePoint?: any;
            changeTo?: any;
            volume?: number;
            reverseAt?: any;
            startAs?: any;
            startOfYear?: any;
            startOfQuarter?: any;
            startOfMonth?: any;
            startOfWeek?: any;
        } = {};
        let direction = 0;

        rawData.forEach(function (d, idx) {
            if (isNotDefined(brick.from)) {
                brick.high = d.high;
                brick.low = d.low;
                brick.startOfYear = d.startOfYear;
                brick.startOfQuarter = d.startOfQuarter;
                brick.startOfMonth = d.startOfMonth;
                brick.startOfWeek = d.startOfWeek;

                brick.from = idx;
                brick.fromDate = dateAccessor(d);
                // indexMutator(brick, index++);
                dateMutator(brick, dateAccessor(d));
            }
            brick.volume = (brick.volume || 0) + d.volume;

            const prevCloseToHigh = (prevBrickClose - pricingMethod(d).high);
            const prevCloseToLow = (prevBrickClose - pricingMethod(d).low);
            const prevOpenToHigh = (prevBrickOpen - pricingMethod(d).high);
            const prevOpenToLow = (prevBrickOpen - pricingMethod(d).low);
            const priceMovement = Math.min(
                Math.abs(prevCloseToHigh),
                Math.abs(prevCloseToLow),
                Math.abs(prevOpenToHigh),
                Math.abs(prevOpenToLow));

            // @ts-ignore
            brick.high = Math.max(brick.high, d.high);
            // @ts-ignore
            brick.low = Math.min(brick.low, d.low);

            if (!brick.startOfYear) {
                brick.startOfYear = d.startOfYear;
                if (brick.startOfYear) {
                    dateMutator(brick, dateAccessor(d));
                    // brick.displayDate = d.displayDate;
                }
            }

            if (!brick.startOfQuarter) {
                brick.startOfQuarter = d.startOfQuarter;
                if (brick.startOfQuarter && !brick.startOfYear) {
                    dateMutator(brick, dateAccessor(d));
                    // brick.displayDate = d.displayDate;
                }
            }

            if (!brick.startOfMonth) {
                brick.startOfMonth = d.startOfMonth;
                if (brick.startOfMonth && !brick.startOfQuarter) {
                    dateMutator(brick, dateAccessor(d));
                    // brick.displayDate = d.displayDate;
                }
            }
            if (!brick.startOfWeek) {
                brick.startOfWeek = d.startOfWeek;
                if (brick.startOfWeek && !brick.startOfMonth) {
                    dateMutator(brick, dateAccessor(d));
                    // brick.displayDate = d.displayDate;
                }
            }

            // d.brick = JSON.stringify(brick);
            if (brickSize(d)) {
                const noOfBricks = Math.floor(priceMovement / brickSize(d));

                brick.open = (Math.abs(prevCloseToHigh) < Math.abs(prevOpenToHigh)
                    || Math.abs(prevCloseToLow) < Math.abs(prevOpenToLow))
                    ? prevBrickClose
                    : prevBrickOpen;

                if (noOfBricks >= 1) {
                    let j = 0;
                    for (j = 0; j < noOfBricks; j++) {
                        // @ts-ignore
                        brick.close = (brick.open < pricingMethod(d).high)
                            // if brick open is less than current price it means it is green/hollow brick
                            ? brick.open + brickSize(d)
                            // @ts-ignore
                            : brick.open - brickSize(d);
                        // @ts-ignore
                        direction = brick.close > brick.open ? 1 : -1;
                        brick.direction = direction;
                        brick.to = idx;
                        brick.toDate = dateAccessor(d);
                        // brick.diff = brick.open - brick.close;
                        // brick.atr = d.atr;
                        brick.fullyFormed = true;
                        renkoData.push(brick);

                        prevBrickClose = brick.close;
                        prevBrickOpen = brick.open;

                        const newBrick = {
                            high: brick.high,
                            low: brick.low,
                            open: brick.close,
                            startOfYear: false,
                            startOfMonth: false,
                            startOfQuarter: false,
                            startOfWeek: false,
                        };
                        brick = newBrick;
                        brick.from = idx;
                        brick.fromDate = dateAccessor(d);
                        // indexMutator(brick, index + j);
                        dateMutator(brick, dateAccessor(d));
                        brick.volume = (brick.volume || 0) + d.volume;
                    }
                    index = index + j - 1;
                    brick = {};
                } else {
                    if (idx === rawData.length - 1) {
                        brick.close = direction > 0 ? pricingMethod(d).high : pricingMethod(d).low;
                        brick.to = idx;
                        brick.toDate = dateAccessor(d);
                        dateMutator(brick, dateAccessor(d));
                        brick.fullyFormed = false;
                        renkoData.push(brick);
                    }
                }
            }

        });
        return renkoData;

    }
    calculator.options = function (x) {
        if (!arguments.length) {
            return options;
        }
        options = { ...defaultOptions, ...x };
        return calculator;
    };

    calculator.dateMutator = function (x) {
        if (!arguments.length) { return dateMutator; }
        dateMutator = x;
        return calculator;
    };
    calculator.dateAccessor = function (x) {
        if (!arguments.length) { return dateAccessor; }
        dateAccessor = x;
        return calculator;
    };

    return calculator;
}
