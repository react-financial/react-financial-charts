import { getClosestItemIndexes, getClosestItem } from "../closestItem";

const data = [
    {
        date: 1,
    },
    {
        date: 2,
    },
    {
        date: 3,
    },
    {
        date: 4,
    },
    {
        date: 5,
    },
    {
        date: 6,
    },
];

describe("getClosestItemIndexes", () => {
    test.each`
        value  | expectedLeft | expectedRight
        ${2.4} | ${1}         | ${2}
        ${5}   | ${4}         | ${4}
        ${5.6} | ${4}         | ${5}
        ${0.2} | ${0}         | ${0}
        ${6.2} | ${5}         | ${5}
    `("should pick the indexes either side of data", ({ value, expectedLeft, expectedRight }) => {
        const { left, right } = getClosestItemIndexes(data, value, (d) => d.date);

        expect(left).toBe(expectedLeft);
        expect(right).toBe(expectedRight);
    });

    test("should pick exact index if it exists", () => {
        const { left, right } = getClosestItemIndexes(data, 3, (d) => d.date);

        expect(left).toBe(2);
        expect(right).toBe(2);
    });

    test("should work with dates", () => {
        const dates = [
            {
                date: new Date(2020, 8, 26, 12, 0),
            },
            {
                date: new Date(2020, 8, 26, 12, 10),
            },
            {
                date: new Date(2020, 8, 26, 12, 20),
            },
            {
                date: new Date(2020, 8, 26, 12, 40),
            },
        ];

        const value = new Date(2020, 8, 26, 12, 15);

        const { left, right } = getClosestItemIndexes(dates, value, (d) => d.date);

        expect(left).toBe(1);
        expect(right).toBe(2);
    });
});

describe("getClosestItem", () => {
    test("should pick exact item if it exists", () => {
        const item = getClosestItem(data, 3, (d) => d.date);

        expect(item.date).toBe(3);
    });

    test("should pick closest to right", () => {
        const item = getClosestItem(data, 3.6, (d) => d.date);

        expect(item.date).toBe(4);
    });

    test("should pick closest to left", () => {
        const item = getClosestItem(data, 3.2, (d) => d.date);

        expect(item.date).toBe(3);
    });
});
