export * from "./Annotate";
export { LabelAnnotation } from "./LabelAnnotation";
export * from "./SvgPathAnnotation";
export * from "./Label";

const halfWidth = 10;
const bottomWidth = 3;
const height = 20;

export const buyPath = ({ x, y }: { x: number; y: number }) => {
    return `M${x} ${y} `
        + `L${x + halfWidth} ${y + halfWidth} `
        + `L${x + bottomWidth} ${y + halfWidth} `
        + `L${x + bottomWidth} ${y + height} `
        + `L${x - bottomWidth} ${y + height} `
        + `L${x - bottomWidth} ${y + halfWidth} `
        + `L${x - halfWidth} ${y + halfWidth} `
        + "Z";
};

export const sellPath = ({ x, y }: { x: number; y: number }) => {
    return `M${x} ${y} `
        + `L${x + halfWidth} ${y - halfWidth} `
        + `L${x + bottomWidth} ${y - halfWidth} `
        + `L${x + bottomWidth} ${y - height} `
        + `L${x - bottomWidth} ${y - height} `
        + `L${x - bottomWidth} ${y - halfWidth} `
        + `L${x - halfWidth} ${y - halfWidth} `
        + "Z";
};
