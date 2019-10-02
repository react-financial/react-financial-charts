import { isNotDefined } from "../utils";
import { PointAndFigure as defaultOptions } from "./defaultOptionsForComputation";

function createBox(d, dateAccessor, dateMutator) {
    const box = {
        open: d.open,
        fromDate: dateAccessor(d),
        toDate: dateAccessor(d),
        startOfYear: d.startOfYear,
        startOfQuarter: d.startOfQuarter,
        startOfMonth: d.startOfMonth,
        startOfWeek: d.startOfWeek,
    };
    dateMutator(box, dateAccessor(d));
    return box;
}

function updateColumns(columnData, dateAccessor, dateMutator) {
    columnData.forEach(function (d) {
        // var lastBox = d.boxes[d.boxes.length - 1];

        d.startOfYear = false;
        d.startOfQuarter = false;
        d.startOfMonth = false;
        d.startOfWeek = false;

        d.boxes.forEach(function (eachBox) {
            if (isNotDefined(d.open)) { d.open = eachBox.open; }
            d.close = eachBox.close;
            d.high = Math.max(d.open, d.close);
            d.low = Math.min(d.open, d.close);

            if (isNotDefined(d.fromDate)) { d.fromDate = eachBox.fromDate; }
            if (isNotDefined(d.date)) { d.date = eachBox.date; }
            d.toDate = eachBox.toDate;

            if (eachBox.startOfYear) {
                d.startOfYear = d.startOfYear || eachBox.startOfYear;
                d.startOfQuarter = eachBox.startOfQuarter;
                d.startOfMonth = eachBox.startOfMonth;
                d.startOfWeek = eachBox.startOfWeek;

                dateMutator(d, dateAccessor(eachBox));
            }
            if (d.startOfQuarter !== true && eachBox.startOfQuarter) {
                d.startOfQuarter = eachBox.startOfQuarter;
                d.startOfMonth = eachBox.startOfMonth;
                d.startOfWeek = eachBox.startOfWeek;
                // d.displayDate = eachBox.displayDate;
                dateMutator(d, dateAccessor(eachBox));
            }
            if (d.startOfMonth !== true && eachBox.startOfMonth) {
                d.startOfMonth = eachBox.startOfMonth;
                d.startOfWeek = eachBox.startOfWeek;
                // d.displayDate = eachBox.displayDate;
                dateMutator(d, dateAccessor(eachBox));
            }
            if (d.startOfWeek !== true && eachBox.startOfWeek) {
                d.startOfWeek = eachBox.startOfWeek;
                // d.displayDate = eachBox.displayDate;
                dateMutator(d, dateAccessor(eachBox));
            }
        });

    });

    // console.table(columnData);
    // console.table(rawData);
    return columnData;
}

export default function () {
    let options = defaultOptions;
    let dateAccessor = (d) => d.date;
    let dateMutator = (d, date) => { d.date = date; };

    const calculator = (rawData: any[]) => {
        const { reversal, boxSize, sourcePath } = options;

        const source = sourcePath === "high/low"
            ? (d) => ({ high: d.high, low: d.low })
            : (d) => ({ high: d.close, low: d.close });

        const pricingMethod = source;
        const columnData: any[] = [];

        // @ts-ignore
        let column: {
            boxes: any[];
            direction: any;
            open: number;
            close?: number;
        } = {
            boxes: [],
            open: rawData[0].open,
        };
        let box = createBox(rawData[0], dateAccessor, dateMutator);

        columnData.push(column);

        rawData.forEach(function (d) {
            // @ts-ignore
            column.volume = (column.volume || 0) + d.volume;

            if (!box.startOfYear) {
                box.startOfYear = d.startOfYear;
                if (box.startOfYear) {
                    dateMutator(box, dateAccessor(d));
                    // box.displayDate = d.displayDate;
                }
            }

            if (!box.startOfYear && !box.startOfQuarter) {
                box.startOfQuarter = d.startOfQuarter;
                if (box.startOfQuarter && !box.startOfYear) {
                    dateMutator(box, dateAccessor(d));
                    // box.displayDate = d.displayDate;
                }
            }

            if (!box.startOfQuarter && !box.startOfMonth) {
                box.startOfMonth = d.startOfMonth;
                if (box.startOfMonth && !box.startOfQuarter) {
                    dateMutator(box, dateAccessor(d));
                    // box.displayDate = d.displayDate;
                }
            }
            if (!box.startOfMonth && !box.startOfWeek) {
                box.startOfWeek = d.startOfWeek;
                if (box.startOfWeek && !box.startOfMonth) {
                    dateMutator(box, dateAccessor(d));
                    // box.displayDate = d.displayDate;
                }
            }

            if (columnData.length === 1 && column.boxes.length === 0) {
                const upwardMovement = (Math.max((pricingMethod(d).high - column.open), 0)); // upward movement
                const downwardMovement = Math.abs(Math.min((column.open - pricingMethod(d).low), 0)); // downward movement
                column.direction = upwardMovement > downwardMovement ? 1 : -1;
                if (boxSize * reversal < upwardMovement
                    || boxSize * reversal < downwardMovement) {
                    // enough movement to trigger a reversal
                    box.toDate = dateAccessor(d);
                    box.open = column.open;
                    const noOfBoxes = column.direction > 0
                        ? Math.floor(upwardMovement / boxSize)
                        : Math.floor(downwardMovement / boxSize);
                    for (let i = 0; i < noOfBoxes; i++) {
                        // @ts-ignore
                        box.close = box.open + column.direction * boxSize;
                        // @ts-ignore
                        const prevBoxClose = box.close;
                        column.boxes.push(box);
                        box = createBox(box, dateAccessor, dateMutator);
                        // box = cloneMe(box);
                        box.open = prevBoxClose;
                    }
                    box.fromDate = dateAccessor(d);
                    // @ts-ignore
                    box.date = dateAccessor(d);
                }
            } else {
                // one or more boxes already formed in the current column
                const upwardMovement = (Math.max((pricingMethod(d).high - box.open), 0)); // upward movement
                const downwardMovement = Math.abs(Math.min((pricingMethod(d).low - box.open), 0)); // downward movement

                if ((column.direction > 0 && upwardMovement > boxSize) /* rising column AND box can be formed */
                    || (column.direction < 0 && downwardMovement > boxSize) /* falling column AND box can be formed */) {
                    // form another box
                    // @ts-ignore
                    box.close = box.open + column.direction * boxSize;
                    box.toDate = dateAccessor(d);

                    // @ts-ignore
                    const prevBoxClose = box.close;
                    column.boxes.push(box);
                    box = createBox(d, dateAccessor, dateMutator);
                    box.open = prevBoxClose;
                    box.fromDate = dateAccessor(d);
                    dateMutator(box, dateAccessor(d));
                } else if (
                    /* rising column and there is downward movement to trigger a reversal */
                    (column.direction > 0 && downwardMovement > boxSize * reversal)
                    /* falling column and there is downward movement to trigger a reversal */
                    || (column.direction < 0 && upwardMovement > boxSize * reversal)) {
                    // reversal

                    box.open = box.open + -1 * column.direction * boxSize;
                    box.toDate = dateAccessor(d);
                    // box.displayDate = d.displayDate;
                    dateMutator(box, dateAccessor(d));
                    // box.startOfYear = d.startOfYear;
                    // box.startOfQuarter = d.startOfQuarter;
                    // box.startOfMonth = d.startOfMonth;
                    // box.startOfWeek = d.startOfWeek;
                    // console.table(column.boxes);
                    // var idx = index + 1;
                    column = {
                        boxes: [],
                        // @ts-ignore
                        volume: 0,
                        direction: -1 * column.direction,
                    };
                    const noOfBoxes = column.direction > 0
                        ? Math.floor(upwardMovement / boxSize)
                        : Math.floor(downwardMovement / boxSize);
                    for (let i = 0; i < noOfBoxes; i++) {
                        // @ts-ignore
                        box.close = box.open + column.direction * boxSize;
                        // @ts-ignore
                        const prevBoxClose = box.close;
                        column.boxes.push(box);
                        box = createBox(d, dateAccessor, dateMutator);
                        box.open = prevBoxClose;
                    }

                    columnData.push(column);
                }
            }
        });
        updateColumns(columnData, dateAccessor, dateMutator);

        return columnData;
    };

    calculator.options = (newOptions?: any) => {
        if (newOptions === undefined) {
            return options;
        }

        options = { ...defaultOptions, ...newOptions };

        return calculator;
    };

    calculator.dateMutator = (newDateMutator?: any) => {
        if (newDateMutator === undefined) {
            return dateMutator;
        }

        dateMutator = newDateMutator;

        return calculator;
    };

    calculator.dateAccessor = (newDateAccessor?: any) => {
        if (newDateAccessor === undefined) {
            return dateAccessor;
        }

        dateAccessor = newDateAccessor;

        return calculator;
    };

    return calculator;
}
