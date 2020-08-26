export const getClosestItemIndexes = <T, TAccessor extends number | Date>(
    array: T[],
    value: TAccessor,
    accessor: (item: T) => TAccessor,
) => {
    let lo = 0;
    let hi = array.length - 1;
    while (hi - lo > 1) {
        const mid = Math.round((lo + hi) / 2);
        const itemAtMid = array[mid];
        const valueAtMid = accessor(itemAtMid);
        if (valueAtMid <= value) {
            lo = mid;
        } else {
            hi = mid;
        }
    }

    const lowItemValue = accessor(array[lo]);
    const highItemValue = accessor(array[hi]);

    // for Date object === does not work, so using the <= in combination with >=
    // the same code works for both dates and numbers
    if (lowItemValue?.valueOf() === value?.valueOf()) {
        hi = lo;
    }
    if (highItemValue?.valueOf() === value?.valueOf()) {
        lo = hi;
    }

    if (lowItemValue < value && highItemValue < value) {
        lo = hi;
    }
    if (lowItemValue > value && highItemValue > value) {
        hi = lo;
    }

    return { left: lo, right: hi };
};

export const getClosestItem = <T, TAccessor extends number | Date>(
    array: T[],
    value: TAccessor,
    accessor: (item: T) => TAccessor,
) => {
    const { left, right } = getClosestItemIndexes(array, value, accessor);
    if (left === right) {
        return array[left];
    }

    const leftItem = accessor(array[left]);
    const rightItem = accessor(array[right]);

    const closest =
        Math.abs(leftItem.valueOf() - value.valueOf()) < Math.abs(rightItem.valueOf() - value.valueOf())
            ? array[left]
            : array[right];

    return closest;
};
