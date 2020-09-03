// copied from https://github.com/d3fc/d3fc-rebind/blob/master/src/rebind.js

function createReboundMethod(target: any, source: any, name: string) {
    const method = source[name];
    if (typeof method !== "function") {
        throw new Error(`Attempt to rebind ${name} which isn't a function on the source object`);
    }
    return (...args: any[]) => {
        const value = method.apply(source, args);
        return value === source ? target : value;
    };
}

export default function rebind(target: any, source: any, ...names: string[]) {
    for (const name of names) {
        target[name] = createReboundMethod(target, source, name);
    }
    return target;
}
