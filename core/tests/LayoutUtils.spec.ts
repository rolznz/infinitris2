import "jasmine";
import LayoutUtils from "../src/block/layout/LayoutUtils";

describe("LayoutUtils", () => {
    it("can rotate complex shapes", () => {
        const layout = [
            [0, 0, 1, 1],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 1, 0]];

        const expected = [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 1]];

        expect(LayoutUtils.rotate(layout, 1)).toEqual(expected);
        expect(LayoutUtils.rotate(layout, 5)).toEqual(expected);
    });

    it("can rotate clockwise", () => {
        const layout = [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]];

        const expected = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]];

        expect(LayoutUtils.rotate(layout, 1)).toEqual(expected);
        expect(LayoutUtils.rotate(layout, 5)).toEqual(expected);
    });
    it("can rotate anticlockwise", () => {
        const layout = [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]];

        const expected = [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]];

        expect(LayoutUtils.rotate(layout, -1)).toEqual(expected);
        expect(LayoutUtils.rotate(layout, -5)).toEqual(expected);
    });
    it("cannot rotate a layout that has more or less rows than columns", () => {
        const layout = [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]];
        expect(() => LayoutUtils.rotate(layout, -1))
            .toThrowError("Layout must have the same number of rows and columns");
    });
});