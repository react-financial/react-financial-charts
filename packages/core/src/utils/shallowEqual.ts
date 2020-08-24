export const shallowEqual = (a: any, b: any) => {
    if (a === b) {
        return true;
    }
    if (!(a instanceof Object) || !(b instanceof Object)) {
        return false;
    }

    const keys = Object.keys(a);
    const length = keys.length;

    for (let i = 0; i < length; i++) {
        if (!(keys[i] in b)) {
            return false;
        }
    }

    for (let i = 0; i < length; i++) {
        if (a[keys[i]] !== b[keys[i]]) {
            return false;
        }
    }

    return length === Object.keys(b).length;
};
