import { colorToRGBA } from "../colors";

describe("colorToRGBA", () => {
    test.each`
        color                | opacity      | expected
        ${"#000"}            | ${1}         | ${"rgba(0, 0, 0, 1)"}
        ${"#000"}            | ${0.1}       | ${"rgba(0, 0, 0, 0.1)"}
        ${" #000"}           | ${0.1}       | ${"rgba(0, 0, 0, 0.1)"}
        ${"#000 "}           | ${0.1}       | ${"rgba(0, 0, 0, 0.1)"}
        ${"#000000"}         | ${1}         | ${"rgba(0, 0, 0, 1)"}
        ${"#000000"}         | ${0.5}       | ${"rgba(0, 0, 0, 0.5)"}
        ${"#000000"}         | ${undefined} | ${"rgba(0, 0, 0, 1)"}
        ${"rgb(0,0,0)"}      | ${1}         | ${"rgba(0, 0, 0, 1)"}
        ${"rgb(0,0,0)"}      | ${0.5}       | ${"rgba(0, 0, 0, 0.5)"}
        ${"rgb(0,0,0)"}      | ${undefined} | ${"rgba(0, 0, 0, 1)"}
        ${"rgba(0,0,0,1)"}   | ${1}         | ${"rgba(0,0,0,1)"}
        ${"rgba(0,0,0,0.5)"} | ${1}         | ${"rgba(0,0,0,0.5)"}
        ${"rgba(0,0,0,0.5)"} | ${0.1}       | ${"rgba(0,0,0,0.5)"}
        ${"black"}           | ${1}         | ${"rgba(0, 0, 0, 1)"}
        ${"black"}           | ${0.5}       | ${"rgba(0, 0, 0, 0.5)"}
        ${"black"}           | ${undefined} | ${"rgba(0, 0, 0, 1)"}
        ${"Black"}           | ${1}         | ${"rgba(0, 0, 0, 1)"}
        ${"Black"}           | ${1}         | ${"rgba(0, 0, 0, 1)"}
        ${"hsl(0,0,0)"}      | ${1}         | ${"hsl(0,0,0)"}
    `("should convert $color to $expected", ({ color, opacity, expected }) => {
        const rgba = colorToRGBA(color, opacity);

        expect(rgba).toBe(expected);
    });

    test("should throw an exception for an unknown preset color", () => {
        const color = "Unknown";

        expect(() => colorToRGBA(color)).toThrow(`preset color does not exist: ${color}`);
    });

    test("should throw an exception for an invalid rgb color", () => {
        const color = "rgb(a,b,c)";

        expect(() => colorToRGBA(color)).toThrow(`invalid rgb color: ${color}`);
    });
});
