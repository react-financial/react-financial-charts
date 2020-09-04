export const functor = (v: any) => {
    return typeof v === "function" ? v : () => v;
};
