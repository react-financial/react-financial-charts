export const path = (loc: any | any[] = []) => {
    const key = Array.isArray(loc) ? loc : [loc];
    const length = key.length;

    return function (obj: any, defaultValue?: any) {
        if (length === 0) {
            return obj !== undefined && obj !== null ? obj : defaultValue;
        }

        let index = 0;
        while (obj != null && index < length) {
            obj = obj[key[index++]];
        }
        return index === length ? obj : defaultValue;
    };
};
